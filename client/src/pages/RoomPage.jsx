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
    <div className="room-page">
      {currentUser && (
        <h2>Welcome, {currentUser.displayName || currentUser.email}!</h2>
      )}
      <h1>Join a Room</h1>
      
      <div>
        <input
          type="text"
          placeholder="Enter Room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <button onClick={createRoom}>Generate Room ID</button>
      </div>

      <button onClick={joinRoom}>Join Room</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default RoomPage;