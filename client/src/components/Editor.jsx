import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import socket, { joinRoom, sendCodeChange } from "../utils/socket";
import { useParams } from "react-router-dom";

const CodeEditor = () => {
  const { roomId } = useParams(); // Get Room ID from URL
  const [code, setCode] = useState("// Start coding...");

  useEffect(() => {
    joinRoom(roomId);
  
    socket.on("codeUpdate", (newCode) => {
      if (typeof newCode === "string") {
        setCode(newCode);
      } else {
        console.error("Received invalid code data:", newCode);
      }
    });
  
    return () => {
      socket.off("codeUpdate");
    };
  }, [roomId]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    sendCodeChange(roomId, newCode); // Send code update with room ID
  };

  return (
    <Editor
      height="70vh"
      defaultLanguage="javascript"
      value={code}
      onChange={handleCodeChange}
      theme="vs-dark"
    />
  );
};

export default CodeEditor;
