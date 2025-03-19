import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";
import socket, {
  joinRoom,
  sendCodeChange,
  sendCursorPosition,
} from "../utils/socket";
import { auth } from "../utils/firebase";
import * as monaco from "monaco-editor";

const CodeEditor = ({ language }) => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("// Start coding...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJoinAccepted, setIsJoinAccepted] = useState(false);
  const [cursorPositions, setCursorPositions] = useState({});
  const editorRef = useRef(null);
  const decorationMappingRef = useRef({});
  const remoteCursorWidgetsRef = useRef({});

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      joinRoom(roomId, {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email,
      });
    }

    socket.on("roomAdminStatus", (data) => {
      setIsAdmin(data.isAdmin);
      if (data.isAdmin) setIsJoinAccepted(true);
    });

    socket.on("joinAccepted", (data) => {
      if (data.roomId === roomId) setIsJoinAccepted(true);
    });

    socket.on("joinRejected", (data) => {
      if (data.roomId === roomId) {
        alert("Your join request was rejected.");
        navigate("/");
      }
    });

    socket.on("codeUpdate", (newCode) => {
      if (typeof newCode === "string") setCode(newCode);
    });

    socket.on("updateCursorPositions", (positions) => {
      const currentUser = auth.currentUser;
      setCursorPositions((prev) => {
        const newPositions = { ...positions };
        if (currentUser && prev[currentUser.uid]) {
          newPositions[currentUser.uid] = prev[currentUser.uid];
        }
        return newPositions;
      });
    });

    return () => {
      socket.off("roomAdminStatus");
      socket.off("joinAccepted");
      socket.off("joinRejected");
      socket.off("codeUpdate");
      socket.off("updateCursorPositions");
    };
  }, [roomId, navigate]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    sendCodeChange(roomId, newCode);
  };

  const handleCursorChange = () => {
    const currentUser = auth.currentUser;
    if (currentUser && editorRef.current) {
      const position = editorRef.current.getPosition();
      sendCursorPosition(
        roomId,
        {
          uid: currentUser.uid,
          name: currentUser.displayName || currentUser.email,
        },
        position
      );
      setCursorPositions((prev) => ({
        ...prev,
        [currentUser.uid]: {
          user: {
            uid: currentUser.uid,
            name: currentUser.displayName || currentUser.email,
          },
          position,
        },
      }));
    }
  };

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (
      editorRef.current &&
      currentUser &&
      cursorPositions[currentUser.uid]
    ) {
      const localPos = cursorPositions[currentUser.uid].position;
      const decoration = {
        range: new monaco.Range(
          localPos.lineNumber,
          localPos.column,
          localPos.lineNumber,
          localPos.column
        ),
        options: {
          beforeContentClassName: `cursor-pointer-${currentUser.uid}`,
          afterContentClassName: `cursor-label-${currentUser.uid}`,
          stickiness:
            monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      };
      const oldDecorations = Object.values(decorationMappingRef.current);
      const newDecorationIds = editorRef.current.deltaDecorations(
        oldDecorations,
        [decoration]
      );
      decorationMappingRef.current[currentUser.uid] = newDecorationIds[0];
    }
  }, [cursorPositions]);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (editorRef.current) {
      Object.entries(cursorPositions).forEach(([uid, { user, position }]) => {
        if (currentUser && uid === currentUser.uid) return;
        let widget = remoteCursorWidgetsRef.current[uid];
        if (!widget) {
          widget = {
            uid,
            domNode: document.createElement("div"),
            getId: () => `remoteCursorWidget-${uid}`,
            getDomNode: function () {
              return this.domNode;
            },
            getPosition: () => ({
              position: {
                lineNumber: position.lineNumber,
                column: position.column,
              },
              preference: [
                monaco.editor.ContentWidgetPositionPreference.EXACT,
              ],
            }),
          };
          widget.domNode.style.position = "absolute";
          widget.domNode.style.transform = "translate(0%, calc(100% + 4px))";
          widget.domNode.style.background = getColorForUser(uid);
          widget.domNode.style.color = "#fff";
          widget.domNode.style.width = "16px";
          widget.domNode.style.height = "16px";
          widget.domNode.style.display = "flex";
          widget.domNode.style.alignItems = "center";
          widget.domNode.style.justifyContent = "center";
          widget.domNode.style.fontSize = "10px";
          widget.domNode.style.lineHeight = "16px";
          widget.domNode.style.borderRadius = "3px";
          widget.domNode.style.zIndex = "10";
          widget.domNode.style.whiteSpace = "nowrap";
          widget.domNode.style.textAlign = "center";
          widget.domNode.title = user.name;
          widget.domNode.innerText = user.name.charAt(0);
          editorRef.current.addContentWidget(widget);
          remoteCursorWidgetsRef.current[uid] = widget;
        } else {
          widget.getPosition = () => ({
            position: {
              lineNumber: position.lineNumber,
              column: position.column,
            },
            preference: [
              monaco.editor.ContentWidgetPositionPreference.EXACT,
            ],
          });
          editorRef.current.layoutContentWidget(widget);
        }
      });
    }
  }, [cursorPositions]);

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  const renderCursorStyles = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    const color = getColorForUser(currentUser.uid);
    const fullName = currentUser.displayName || currentUser.email;
    const initial = fullName.charAt(0);
    return (
      <style>
        {`
          .cursor-pointer-${currentUser.uid} {
            position: relative;
          }
          .cursor-pointer-${currentUser.uid}::before {
            content: '${initial}';
            position: absolute;
            bottom: -20px;
            left: 0;
            background: ${color};
            color: #fff;
            width: 16px;
            height: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            border-radius: 3px;
          }
        `}
      </style>
    );
  };

  const getColorForUser = (uid) => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF"];
    const index = uid.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!isJoinAccepted) {
    return (
      <div className="flex flex-col justify-center items-center p-4 h-full">
        <h2 className="text-xl font-bold mb-2">Waiting for admin approval...</h2>
        <p className="text-gray-600">
          Please wait while the admin approves your join request.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full p-2">
      <Editor
        height="100%"
        language={language}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        onMount={(editor) => {
          editorRef.current = editor;
          editor.onDidChangeCursorSelection(() => {
            handleCursorChange();
          });
        }}
        options={{
          fontSize: 20, // Increased font size
        }}
        className="rounded-lg shadow-lg"
      />
      {renderCursorStyles()}
    </div>
  );
};

export default CodeEditor;