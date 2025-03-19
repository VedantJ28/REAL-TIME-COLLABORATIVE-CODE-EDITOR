import React, { useState, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa"; // Import send icon
import socket from "../utils/socket";

const ChatBox = ({ roomId, user }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    // Join the room and request chat history
    socket.emit("joinRoom", { roomId, user });

    // Listen for chat history
    socket.on("chatHistory", (history) => {
      setMessages(history);
    });

    // Listen for new messages
    socket.on("messageReceived", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    // Listen for room closure
    socket.on("roomClosed", () => {
      setMessages([]); // Clear messages locally
    });

    return () => {
      socket.off("chatHistory");
      socket.off("messageReceived");
      socket.off("roomClosed");
    };
  }, [roomId]);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    // Emit the new message to the server
    socket.emit("newMessage", { roomId, user, text: newMessage });
    setNewMessage("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const getUserColor = (username) => {
    // Generate a consistent color for each user based on their name
    const colors = ["text-blue-500", "text-green-500", "text-red-500", "text-purple-500", "text-yellow-500"];
    const index = username.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="chat-box flex flex-col h-[530px] p-4 border border-gray-300 rounded-lg bg-white shadow-lg">
      {/* Messages Section */}
      <div className="messages flex-1 overflow-y-auto p-4 bg-gray-50 border border-gray-200 rounded-lg mb-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const showUsername =
              index === 0 || messages[index - 1].user !== msg.user; // Show username only if it's the first message or the user changes
            return (
              <div key={index} className="mb-3">
                {showUsername && (
                  <p className={`text-sm font-bold ${getUserColor(msg.user)} mb-1`}>
                    {msg.user}
                  </p>
                )}
                <p className="text-sm break-words whitespace-normal">{msg.text}</p>
                <hr className="border-t border-gray-300 my-2" />
              </div>
            );
          })
        ) : (
          <p className="text-gray-500 text-center">No messages yet. Start the conversation!</p>
        )}
      </div>

      {/* Input Section */}
      <div className="flex items-center space-x-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown} // Listen for Enter key
          placeholder="Type a message..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
        >
          <FaPaperPlane className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;