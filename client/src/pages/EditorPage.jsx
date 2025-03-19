// ...existing code...
import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/Editor";
import ChatBox from "../components/ChatBox";
import JoinRequests from "../components/JoinRequests";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";
import socket from "../utils/socket";

const EditorPage = () => {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const user = searchParams.get("name") || "Guest";
  const [isAdmin, setIsAdmin] = useState(false);
  const [roomClosedAlert, setRoomClosedAlert] = useState(null);
  const [confirmLeaveMessage, setConfirmLeaveMessage] = useState(null);
  const [language, setLanguage] = useState("javascript");

  useEffect(() => {
    socket.on("roomAdminStatus", (data) => {
      setIsAdmin(data.isAdmin);
    });

    socket.on("roomClosed", () => {
      if (!isAdmin) {
        setRoomClosedAlert("Room closed by admin. You will be redirected.");
      }
    });

    // Listen for language changes from admin and update if not admin
    socket.on("languageUpdate", (data) => {
      if (!isAdmin) {
        setLanguage(data.language);
      }
    });

    return () => {
      socket.off("roomAdminStatus");
      socket.off("roomClosed");
      socket.off("languageUpdate");
    };
  }, [isAdmin, navigate]);

  const onLeaveRoom = () => {
    if (isAdmin) {
      setConfirmLeaveMessage(
        "Are you sure want to leave the room? Other users in this room will be automatically disconnected"
      );
    } else {
      setConfirmLeaveMessage("Are you sure you want to leave the room?");
    }
  };

  const handleConfirmLeave = () => {
    if (isAdmin) {
      socket.emit("closeRoom", { roomId });
    } else {
      socket.emit("leaveRoom", { roomId });
    }
    setConfirmLeaveMessage(null);
    navigate("/");
  };

  const handleCancelLeave = () => {
    setConfirmLeaveMessage(null);
  };

  // Only admin can change the language.
  const handleLanguageChange = (e) => {
    if (isAdmin) {
      const newLanguage = e.target.value;
      setLanguage(newLanguage);
      socket.emit("languageChange", { roomId, language: newLanguage });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Navbar */}
      <Navbar
        roomId={roomId}
        user={user}
        onLeaveRoom={onLeaveRoom}
        selectedLanguage={language}
        onLanguageChange={handleLanguageChange}
        isAdmin={isAdmin}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Code Editor Section */}
        <main className="flex-1 p-4">
          <div className="bg-white shadow rounded-lg h-full overflow-hidden">
            <CodeEditor roomId={roomId} language={language} />
          </div>
        </main>

        {/* Sidebar Section: Chat, Conditional Join Requests (admin), & Active Users */}
        <aside className="w-full lg:w-1/3 p-4 space-y-4">
          <div className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Chat</h2>
            <ChatBox roomId={roomId} user={user} />
          </div>
          {isAdmin && (
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-bold text-gray-800 mb-2">Join Requests</h2>
              <JoinRequests roomId={roomId} />
            </div>
          )}
        </aside>
      </div>

      {/* Confirmation alert for leaving */}
      {confirmLeaveMessage && (
        <Alert
          message={confirmLeaveMessage}
          onConfirm={handleConfirmLeave}
          onCancel={handleCancelLeave}
        />
      )}

      {/* Room closed alert for non-admin users */}
      {roomClosedAlert && (
        <Alert
          message={roomClosedAlert}
          onConfirm={() => navigate("/")}
        />
      )}
    </div>
  );
};

export default EditorPage;