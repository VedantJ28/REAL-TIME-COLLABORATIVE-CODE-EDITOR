import React, { useState, useEffect, useRef } from "react";
import { FaCopy } from "react-icons/fa"; // Import the copy icon
import UserList from "./UserList";
import JoinRequests from "./JoinRequests";

const Navbar = ({ roomId, user, onLeaveRoom, selectedLanguage, onLanguageChange, isAdmin }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showJoinRequestsDropdown, setShowJoinRequestsDropdown] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0); // Track pending requests count

  const userDropdownRef = useRef(null);
  const joinRequestsDropdownRef = useRef(null);

  // Function to copy roomId to clipboard
  const copyRoomIdToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied to clipboard!");
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target)
      ) {
        setShowUserDropdown(false);
      }
      if (
        joinRequestsDropdownRef.current &&
        !joinRequestsDropdownRef.current.contains(event.target)
      ) {
        setShowJoinRequestsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
      {/* Logo and Company Name */}
      <div className="flex items-center space-x-4">
        <img
          src="/logo.png" // Replace with your logo path
          alt="Company Logo"
          className="w-10 h-10"
        />
        <h1 className="text-2xl font-bold text-gray-800 tracking-wide">CodeCollab</h1>
      </div>

      {/* Room Info */}
      <div className="text-center md:text-left">
        <h2 className="text-lg font-semibold text-gray-800">Welcome, {user}!</h2>
        <p className="text-sm text-gray-600 flex items-center justify-center md:justify-start space-x-2">
          <span>Room: {roomId}</span>
          <button
            onClick={copyRoomIdToClipboard}
            className="text-black-500 hover:text-black-700 focus:outline-none"
            title="Copy Room ID"
          >
            <FaCopy className="w-4 h-4" />
          </button>
        </p>
      </div>

      {/* Navbar Actions */}
      <div className="flex flex-wrap items-center justify-center md:justify-end space-x-4 md:space-x-6">
        {/* Language Selector (Admin Only) */}
        {isAdmin && (
          <select
            value={selectedLanguage}
            onChange={onLanguageChange}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          <div className="relative" ref={joinRequestsDropdownRef}>
            <button
              onClick={() => setShowJoinRequestsDropdown((prev) => !prev)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400 flex items-center"
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
        <div className="relative" ref={userDropdownRef}>
          <button
            onClick={() => setShowUserDropdown((prev) => !prev)}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
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
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400"
        >
          Leave Room
        </button>
      </div>
    </nav>
  );
};

export default Navbar;