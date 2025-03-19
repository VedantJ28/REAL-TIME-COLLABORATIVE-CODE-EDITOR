import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { logout } from "../utils/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";
import roomIcon from "../assets/join-icon.svg"; // Import as an image
import logoutIcon from "../assets/logout-icon.svg"; // Import as an image

const RoomPage = () => {
  const [roomId, setRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Generate a new room ID
  const createRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
  };

  // Join the editor with entered room ID and user's name from auth state
  const joinRoom = () => {
    if (!currentUser || !roomId.trim()) {
      alert("Please ensure you are logged in and enter a valid Room ID.");
      return;
    }
    const userName = currentUser.displayName || currentUser.email;
    navigate(`/editor/${roomId}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center py-12 px-4">
      {/* Header with Logo and Company Name */}
      <header className="w-full max-w-5xl flex items-center justify-between mb-12 px-6">
        <div className="flex items-center space-x-4">
          <img
            src="/logo.png" // Replace with your logo path
            alt="Company Logo"
            className="w-14 h-14"
          />
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-wide">
            CodeCollab
          </h1>
        </div>
        {currentUser && (
          <button
            onClick={logout}
            className="flex items-center space-x-2 py-2 px-5 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 shadow-md"
          >
            <img src={logoutIcon} alt="Logout Icon" className="w-6 h-6" />
            <span className="text-lg font-medium">Logout</span>
          </button>
        )}
      </header>

      {/* Main Content */}
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-2xl p-10">
        {currentUser && (
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            Welcome, {currentUser.displayName || currentUser.email}!
          </h2>
        )}
        <h1 className="text-2xl font-semibold text-gray-700 mb-8 text-center">
          Join or Create a Room
        </h1>
        <div className="mb-6">
          <label
            htmlFor="roomId"
            className="block text-sm font-medium text-gray-600 mb-2"
          >
            Room ID
          </label>
          <input
            id="roomId"
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700"
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-4 sm:space-y-0">
          <button
            onClick={createRoom}
            className="flex-1 py-4 px-8 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center justify-center space-x-3 shadow-md"
          >
            <img src={roomIcon} alt="Room Icon" className="w-6 h-6" />
            <span className="text-lg font-medium">Generate Room ID</span>
          </button>
          <button
            onClick={joinRoom}
            className="flex-1 py-4 px-8 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 flex items-center justify-center space-x-3 shadow-md"
          >
            <img src={roomIcon} alt="Room Icon" className="w-6 h-6" />
            <span className="text-lg font-medium">Join Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;