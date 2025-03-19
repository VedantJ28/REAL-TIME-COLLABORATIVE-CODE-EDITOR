import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { logout } from "../utils/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../utils/firebase";

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-12">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-8">
        {currentUser && (
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Welcome, {currentUser.displayName || currentUser.email}!
          </h2>
        )}
        <h1 className="text-xl font-semibold text-gray-700 mb-6">
          Join or Create a Room
        </h1>
        <div className="mb-4">
          <label
            htmlFor="roomId"
            className="block text-sm font-medium text-gray-600 mb-1"
          >
            Room ID
          </label>
          <input
            id="roomId"
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div className="flex space-x-2 mb-6">
          <button
            onClick={createRoom}
            className="flex-1 py-2 px-4 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Generate Room ID
          </button>
          <button
            onClick={joinRoom}
            className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Join Room
          </button>
        </div>
        <button
          onClick={logout}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default RoomPage;