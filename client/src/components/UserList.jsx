import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // console.log("UserList mounted, registering updateUsers listener");

    const handleUpdateUsers = (onlineUsers) => {
      // console.log("Received updateUsers:", onlineUsers);
      setUsers(onlineUsers);
    };

    socket.on("updateUsers", handleUpdateUsers);

    // Cleanup the listener on unmount
    return () => {
      // console.log("UserList unmounted, removing updateUsers listener");
      socket.off("updateUsers", handleUpdateUsers);
    };
  }, []);

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-700 mb-2">Active Users</h3>
      <div className="space-y-2">
        {users.length === 0 ? (
          <p className="text-gray-500">No users online</p>
        ) : (
          users.map((user, index) => (
            <div
              key={index}
              className="flex items-center p-2 bg-gray-100 rounded shadow-sm"
            >
              <div className="w-8 h-8 mr-3 bg-blue-500 rounded-full flex items-center justify-center text-white">
                {user.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-800">{user}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;