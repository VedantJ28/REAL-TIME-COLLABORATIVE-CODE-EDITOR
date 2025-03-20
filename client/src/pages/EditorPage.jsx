import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import CodeEditor from "../components/Editor";
import ChatBox from "../components/ChatBox";
import Navbar from "../components/Navbar";
import Alert from "../components/Alert";
import UserNotificationBanner from "../components/UserNotificationBanner";
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
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    socket.on("roomAdminStatus", (data) => {
      setIsAdmin(data.isAdmin);
    });

    socket.on("roomClosed", () => {
      if (!isAdmin) {
        setRoomClosedAlert("Room closed by admin. You will be redirected.");
      }
    });

    // Listen for user join/leave events
    socket.on("userJoined", (data) => {
      if (!isAdmin) {
        addNotification(`${data.user.name} joined the room`, "join");
      }
    });

    socket.on("userLeft", (data) => {
      addNotification(`${data.user.name} left the room`, "leave");
    });

    return () => {
      socket.off("roomAdminStatus");
      socket.off("roomClosed");
      socket.off("userJoined");
      socket.off("userLeft");
    };
  }, [isAdmin]);

  const addNotification = (message, type) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000); // Auto-remove after 5 seconds
  };

  const removeNotification = (id) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  };

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

  const handleLanguageChange = (e) => {
    if (isAdmin) {
      const newLanguage = e.target.value;
      setLanguage(newLanguage);
      socket.emit("languageChange", { roomId, language: newLanguage });
    }
  };

  // Confirm when user clicks the browser back button
  useEffect(() => {
    const handleBrowserBack = (e) => {
      e.preventDefault();
      // Show a default confirm dialog
      const confirmed = window.confirm("Are you sure you want to leave the room?");
      if (!confirmed) {
        // Push the current page back into history if user cancels
        window.history.pushState(null, "", window.location.href);
      } else {
        handleConfirmLeave();
      }
    };
    window.addEventListener("popstate", handleBrowserBack);
    // Push a dummy state to catch back button
    window.history.pushState(null, "", window.location.href);
    return () => {
      window.removeEventListener("popstate", handleBrowserBack);
    };
  }, []);

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

      {/* Notification Banner */}
      <UserNotificationBanner
        notifications={notifications}
        removeNotification={removeNotification}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Code Editor Section */}
        <main className="flex-1 p-4">
          <div className="bg-white shadow rounded-lg h-full overflow-hidden">
            <CodeEditor roomId={roomId} language={language} />
          </div>
        </main>

        {/* Sidebar Section */}
        <aside className="w-full lg:w-1/3 p-4">
          <div className="bg-white shadow rounded-lg p-4 h-[600px] flex flex-col">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Chat</h2>
            <ChatBox roomId={roomId} user={user} />
          </div>
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
        <Alert message={roomClosedAlert} onConfirm={() => navigate("/")} />
      )}
    </div>
  );
};

export default EditorPage;