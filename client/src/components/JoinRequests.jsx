import React, { useState, useEffect } from "react";
import socket from "../utils/socket";

const JoinRequests = ({ setPendingRequestsCount }) => {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    socket.on("joinRequest", (data) => {
      // data: { requesterId, user }
      setRequests((prev) => [...prev, data]);
    });

    return () => socket.off("joinRequest");
  }, []);

  useEffect(() => {
    // Update the pending requests count whenever the requests list changes
    setPendingRequestsCount(requests.length);
  }, [requests, setPendingRequestsCount]);

  const respond = (requesterId, accepted) => {
    socket.emit("respondJoinRequest", { requesterId, accepted });
    setRequests((prev) =>
      prev.filter((req) => req.requesterId !== requesterId)
    );
  };

  return (
    <div>
      {requests.length === 0 ? (
        <p className="text-gray-600">No pending requests.</p>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li
              key={req.requesterId}
              className="flex items-center justify-between border border-gray-200 p-2 rounded"
            >
              <span className="text-gray-700">{req.user.name}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => respond(req.requesterId, true)}
                  className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 focus:outline-none"
                >
                  Accept
                </button>
                <button
                  onClick={() => respond(req.requesterId, false)}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none"
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