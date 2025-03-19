import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

const JoinRequests = () => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    socket.on("joinRequest", (data) => {
      // data: { requesterId, user }
      setRequests((prev) => [...prev, data]);
    });
    return () => socket.off("joinRequest");
  }, []);

  const respond = (requesterId, accepted) => {
    socket.emit("respondJoinRequest", { requesterId, accepted });
    setRequests((prev) =>
      prev.filter((req) => req.requesterId !== requesterId)
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-4 mt-4">
      {/* <h3 className="text-lg font-medium text-gray-800 mb-4">Join Requests</h3> */}
      {requests.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        <ul className="space-y-4">
          {requests.map((req) => (
            <li
              key={req.requesterId}
              className="flex items-center justify-between border border-gray-200 p-3 rounded"
            >
              <span className="text-gray-700">
                {req.user.name} wants to join
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => respond(req.requesterId, true)}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-300"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(req.requesterId, false)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Reject
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JoinRequests;