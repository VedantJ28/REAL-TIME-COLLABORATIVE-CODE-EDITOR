import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const RoomPage = () => {
  const [roomId, setRoomId] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  // Generate a new room ID
  const createRoom = () => {
    const newRoomId = uuidv4();
    setRoomId(newRoomId);
  };

  // Join the editor with entered room ID and name
  const joinRoom = () => {
    if (!name.trim() || !roomId.trim()) {
      alert("Please enter your name and a valid Room ID.");
      return;
    }
    navigate(`/editor/${roomId}?name=${encodeURIComponent(name)}`);
  };

  return (
    <div className="room-page">
      <h1>Join a Room</h1>
      
      <input
        type="text"
        placeholder="Enter your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      
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
    </div>
  );
};

export default RoomPage;
