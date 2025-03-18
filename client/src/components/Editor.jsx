import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import socket, { joinRoom, sendCodeChange } from "../utils/socket";
import { useParams, useNavigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import JoinRequests from "./JoinRequests";

const CodeEditor = () => {
  const { roomId } = useParams(); // Get Room ID from URL
  const [code, setCode] = useState("// Start coding...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isJoinAccepted, setIsJoinAccepted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve user data from Firebase auth
    const currentUser = auth.currentUser;
    if (currentUser) {
      const user = {
        uid: currentUser.uid,
        name: currentUser.displayName || currentUser.email,
      };
      joinRoom(roomId, user);
    }

    socket.on("roomAdminStatus", (data) => {
      setIsAdmin(data.isAdmin);
      // If user is admin, mark join accepted immediately.
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
        alert("Your request to join was rejected by the admin.");
        navigate("/");
      }
    });

    socket.on("codeUpdate", (newCode) => {
      if (typeof newCode === "string") {
        setCode(newCode);
      } else {
        console.error("Received invalid code data:", newCode);
      }
    });

    return () => {
      socket.off("codeUpdate");
      socket.off("roomAdminStatus");
      socket.off("joinAccepted");
      socket.off("joinRejected");
    };
  }, [roomId, navigate]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    sendCodeChange(roomId, newCode);
  };

  if (!isJoinAccepted) {
    // Show a waiting message until admin accepts.
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
      />
      {isAdmin && <JoinRequests />}
    </>
  );
};

export default CodeEditor;