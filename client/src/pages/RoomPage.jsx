import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import { logout } from "../utils/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import joinIcon from "../assets/join-icon.svg";
import logoutIcon from "../assets/logout-icon.svg";
import createIcon from "../assets/create-icon.svg";

const RoomPage = () => {
  const [roomId, setRoomId] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch additional user data from Firestore if available
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().name) {
          setUserName(docSnap.data().name);
        } else {
          // Fallback to displayName or email
          setUserName(user.displayName || user.email);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Create a new room by generating a room ID and navigating to the editor
  const createRoom = () => {
    if (!currentUser) {
      alert("Please ensure you are logged in before creating a room.");
      return;
    }
    const newRoomId = uuidv4();
    navigate(`/editor/${newRoomId}?name=${encodeURIComponent(userName)}`);
  };

  // Join the editor with entered room ID and user's name from Firestore/auth state
  const joinRoom = () => {
    if (!currentUser || !roomId.trim()) {
      alert("Please ensure you are logged in and enter a valid Room ID.");
      return;
    }
    navigate(`/editor/${roomId}?name=${encodeURIComponent(userName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center py-12 px-4">
      {/* Header with Logo and Company Name */}
      <header className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-between mb-12 px-6">
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
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
            Welcome, {userName}!
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
            <img src={createIcon} alt="Room Icon" className="w-6 h-6" />
            <span className="text-lg font-medium">Create Room</span>
          </button>
          <button
            onClick={joinRoom}
            className="flex-1 py-4 px-8 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 flex items-center justify-center space-x-3 shadow-md"
          >
            <img src={joinIcon} alt="Room Icon" className="w-6 h-6" />
            <span className="text-lg font-medium">Join Room</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomPage;