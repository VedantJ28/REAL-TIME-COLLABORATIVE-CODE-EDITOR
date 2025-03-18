import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { useParams, useNavigate } from "react-router-dom";
import socket, { joinRoom, sendCodeChange, sendCursorPosition } from "../utils/socket";
import { auth } from "../utils/firebase";
import JoinRequests from "./JoinRequests";
import * as monaco from "monaco-editor";

const CodeEditor = () => {
  const { roomId } = useParams();
  const [code, setCode] = useState("// Start coding...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJoinAccepted, setIsJoinAccepted] = useState(false);
  // cursorPositions stores both local and remote reported positions.
  const [cursorPositions, setCursorPositions] = useState({});
  const editorRef = useRef(null);
  // Map for local user decoration – only local cursor is updated via decoration.
  const decorationMappingRef = useRef({});
  // Object to hold remote cursor content widgets (uid -> widget)
  const remoteCursorWidgetsRef = useRef({});
  const navigate = useNavigate();

  // Setup socket events.
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
      if (data.isAdmin) {
        setIsJoinAccepted(true);
      }
    });

    socket.on("joinAccepted", (data) => {
      if (data.roomId === roomId) {
        setIsJoinAccepted(true);
      }
    });

    socket.on("joinRejected", (data) => {
      if (data.roomId === roomId) {
        alert("Your join request was rejected.");
        navigate("/");
      }
    });

    socket.on("codeUpdate", (newCode) => {
      if (typeof newCode === "string") {
        setCode(newCode);
      }
    });

    // Handle remote cursor updates and preserve the local user's cursor.
    socket.on("updateCursorPositions", (positions) => {
      console.log("Received updated cursor positions:", positions);
      const currentUser = auth.currentUser;
      setCursorPositions((prev) => {
        const newPositions = { ...positions };
        // Preserve local user's current position.
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
      console.log("Emitting cursor position:", position);
      sendCursorPosition(
        roomId,
        { uid: currentUser.uid, name: currentUser.displayName || currentUser.email },
        position
      );
      // Save the local user’s updated cursor position.
      setCursorPositions((prev) => ({
        ...prev,
        [currentUser.uid]: {
          user: { uid: currentUser.uid, name: currentUser.displayName || currentUser.email },
          position,
        }
      }));
    }
  };

  // Update decoration for the local user's cursor.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (editorRef.current && currentUser && cursorPositions[currentUser.uid]) {
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
          stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
        },
      };
      const oldDecorations = Object.values(decorationMappingRef.current);
      const newDecorationIds = editorRef.current.deltaDecorations(oldDecorations, [decoration]);
      decorationMappingRef.current[currentUser.uid] = newDecorationIds[0];
    }
  }, [cursorPositions]);

  // Update or create content widgets for remote cursors.
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (editorRef.current) {
      Object.entries(cursorPositions).forEach(([uid, { user, position }]) => {
        // Skip creating a widget for the local user.
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
              position: { lineNumber: position.lineNumber, column: position.column },
              preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
            }),
          };
          widget.domNode.style.borderLeft = `2px solid ${getColorForUser(uid)}`;
          widget.domNode.style.height = "1em";
          widget.domNode.style.position = "absolute";
          editorRef.current.addContentWidget(widget);
          remoteCursorWidgetsRef.current[uid] = widget;
        } else {
          widget.getPosition = () => ({
            position: { lineNumber: position.lineNumber, column: position.column },
            preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
          });
          editorRef.current.layoutContentWidget(widget);
        }
      });
    }
  }, [cursorPositions]);

  // Listen to content changes—for example, newline insertions.
  // Here we deliberately do nothing to avoid affecting remote cursors.
  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      const disposables = model.onDidChangeContent((e) => {
        // As an example, you could decide to update the local user only on newline insertion.
        // For now, we're not modifying cursorPositions here.
        const currentUser = auth.currentUser;
        if (currentUser && editorRef.current) {
          // Uncomment below if you wish to update local cursor on newline insertion.
          // const localPos = editorRef.current.getPosition();
          // const isNewlineInsertion = e.changes.some(change => change.text.includes("\n"));
          // if (isNewlineInsertion) {
          //   setCursorPositions(prev => ({
          //     ...prev,
          //     [currentUser.uid]: {
          //       ...prev[currentUser.uid],
          //       position: localPos
          //     }
          //   }));
          // }
        }
      });
      return () => disposables.dispose();
    }
  }, []);

  // Render dynamic styles for the local cursor.
  const renderCursorStyles = () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;
    return (
      <style>
        {`
          .cursor-pointer-${currentUser.uid}:before {
            content: '';
            display: inline-block;
            border-left: 2px solid ${getColorForUser(currentUser.uid)};
            margin-right: 2px;
            height: 1em;
          }
          .cursor-label-${currentUser.uid}::after {
            content: "${currentUser.displayName || currentUser.email}";
            position: absolute;
            margin-left: 4px;
            color: ${getColorForUser(currentUser.uid)};
            font-size: 12px;
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
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h2>Waiting for admin approval...</h2>
        <p>Please wait while the admin approves your join request.</p>
      </div>
    );
  }

  return (
    <>
      <Editor
        height="70vh"
        defaultLanguage="javascript"
        value={code}
        onChange={handleCodeChange}
        theme="vs-dark"
        onMount={(editor) => {
          console.log("Editor mounted:", editor);
          editorRef.current = editor;
          // Listen for every cursor selection change.
          editor.onDidChangeCursorSelection(() => {
            console.log("Cursor selection changed");
            handleCursorChange();
          });
        }}
      />
      {renderCursorStyles()}
      {isAdmin && <JoinRequests />}
    </>
  );
};

export default CodeEditor;