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

  // Socket events to join room, update code, and update cursor positions.
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
      console.log("Received updated cursor positions:", positions);
      const currentUser = auth.currentUser;
      setCursorPositions((prev) => {
        const newPositions = { ...positions };
        // Preserve local user's position.
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

  // Emit local cursor position changes and update local state.
  const handleCursorChange = () => {
    const currentUser = auth.currentUser;
    if (currentUser && editorRef.current) {
      const position = editorRef.current.getPosition();
      console.log("Emitting cursor position:", position);
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

  // Update local user's cursor decoration.
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

  // Create or update remote cursor widgets.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (editorRef.current) {
      Object.entries(cursorPositions).forEach(([uid, { user, position }]) => {
        // Skip local user.
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
          // Updated styling for remote user's floating box to be uniform with local cursor.
          widget.domNode.style.position = "absolute";
          // Place the box below the cursor with a slight offset.
          widget.domNode.style.transform = "translate(0%, calc(100% + 4px))";
          widget.domNode.style.background = getColorForUser(uid);
          widget.domNode.style.color = "#fff";
          // Use same dimensions as local pointer indicator.
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
          // Set a title to mimic hover effect (show full name)
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

  // Update the editor's language when the prop changes.
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        monaco.editor.setModelLanguage(model, language);
      }
    }
  }, [language]);

  // Listen for content changes (if additional handling is needed).
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      const disposables = model.onDidChangeContent((e) => {
        // Handle content changes if required.
      });
      return () => disposables.dispose();
    }
  }, []);

  // Render style for the local cursor indicator.
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
          .cursor-pointer-${currentUser.uid}::after {
            content: "${fullName}";
            position: absolute;
            bottom: -40px;
            left: 0;
            background: #333;
            color: #fff;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 12px;
            white-space: nowrap;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            pointer-events: none;
          }
          .cursor-pointer-${currentUser.uid}:hover::after {
            opacity: 1;
          }
        `}
      </style>
    );
  };

  // Helper to choose a color for each remote user.
  const getColorForUser = (uid) => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#A133FF"];
    const index = uid.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (!isJoinAccepted) {
    return (
      <div className="flex flex-col justify-center items-center p-8">
        <h2 className="text-2xl font-bold mb-2">
          Waiting for admin approval...
        </h2>
        <p className="text-gray-600">
          Please wait while the admin approves your join request.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg mx-6 my-6 p-4">
      <Editor
        height="75vh"
        language={language}
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        onMount={(editor) => {
          console.log("Editor mounted:", editor);
          editorRef.current = editor;
          editor.onDidChangeCursorSelection(() => {
            console.log("Cursor selection changed");
            handleCursorChange();
          });
        }}
        className="mb-4"
      />
      {renderCursorStyles()}
    </div>
  );
};

export default CodeEditor;