import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("updateUsers", (onlineUsers) => setUsers(onlineUsers));

    return () => socket.off("updateUsers");
  }, []);

  return (
    <div className="user-list">
      <h3>Online Users</h3>
      <ul>
        {users.map((user, index) => (
          <li key={index}>{user}</li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
