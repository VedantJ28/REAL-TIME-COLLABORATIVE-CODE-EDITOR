import React, { useState } from "react";
import UserList from "./UserList";
import JoinRequests from "./JoinRequests";

const Navbar = ({ roomId, user, onLeaveRoom, selectedLanguage, onLanguageChange, isAdmin }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showJoinRequestsDropdown, setShowJoinRequestsDropdown] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0); // Track pending requests count

  return (
    <nav className="bg-white shadow py-4 px-6 flex justify-between items-center">
      {/* Room Info */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Room: {roomId}</h1>
        <p className="text-gray-600">Welcome, {user}!</p>
      </div>

      {/* Navbar Actions */}
      <div className="flex items-center space-x-4">
        {/* Language Selector (Admin Only) */}
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

        {/* Join Requests Dropdown (Admin Only) */}
        {isAdmin && (
          <div className="relative">
            <button
              onClick={() => setShowJoinRequestsDropdown((prev) => !prev)}
              className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600 focus:outline-none flex items-center"
            >
              Join Requests
              {pendingRequestsCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {pendingRequestsCount}
                </span>
              )}
            </button>
            <div
              className={`absolute right-0 mt-2 w-64 bg-white border rounded shadow-lg z-10 transition-all duration-300 ${
                showJoinRequestsDropdown ? "" : "hidden"
              }`}
            >
              <div className="p-4 max-h-64 overflow-y-auto">
                <JoinRequests setPendingRequestsCount={setPendingRequestsCount} />
              </div>
            </div>
          </div>
        )}

        {/* User List Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown((prev) => !prev)}
            className="bg-gray-200 p-2 rounded focus:outline-none"
          >
            Users ▼
          </button>
          <div
            className={`absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg z-10 transition-all duration-300 ${
              showUserDropdown ? "" : "hidden"
            }`}
          >
            <UserList />
          </div>
        </div>

        {/* Leave Room Button */}
        <button
          onClick={onLeaveRoom}
          className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 focus:outline-none"
        >
          Leave Room
        </button>
      </div>
    </nav>
  );
};

export default Navbar;