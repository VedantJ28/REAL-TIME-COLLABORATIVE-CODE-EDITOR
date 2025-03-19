import React, { useState } from "react";
import UserList from "./UserList";

const Navbar = ({ roomId, user, onLeaveRoom, selectedLanguage, onLanguageChange, isAdmin }) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <nav className="bg-white shadow py-4 px-6 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Room: {roomId}</h1>
        <p className="text-gray-600">Welcome, {user}!</p>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={onLeaveRoom}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 focus:outline-none"
        >
          Leave Room
        </button>
        {/* Render language selection only if user is admin */}
        {isAdmin && (
          <select
            value={selectedLanguage}
            onChange={onLanguageChange}
            className="border rounded px-2 py-1 focus:outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="csharp">C#</option>
          </select>
        )}
        <div className="relative">
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="bg-gray-200 p-2 rounded focus:outline-none"
          >
            Users ▼
          </button>
          <div
            className={`absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10 transition-all duration-300 ${
              showDropdown ? "" : "hidden"
            }`}
          >
            <UserList />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;