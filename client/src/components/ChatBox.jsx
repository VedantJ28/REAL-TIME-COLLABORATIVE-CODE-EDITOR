import React, { useState, useEffect } from "react";
import { collection, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../utils/firebase";
import socket from "../utils/socket";

const ChatBox = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "rooms", roomId, "messages"),
      orderBy("timestamp")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => doc.data()));
    });

    return () => unsubscribe();
  }, [roomId]);

  const sendMessage = async () => {
    if (newMessage.trim() === "") return;
    await addDoc(collection(db, "rooms", roomId, "messages"), {
      user,
      text: newMessage,
      timestamp: new Date(),
    });

    socket.emit("newMessage", { user, text: newMessage });
    setNewMessage("");
  };

  return (
    <div className="chat-box flex flex-col h-96 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="messages flex-1 overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
        {messages.map((msg, index) => (
          <div key={index} className="mb-3">
            <p className="text-sm">
              <span className="font-bold text-gray-800">{msg.user}: </span>
              {msg.text}
            </p>
          </div>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;