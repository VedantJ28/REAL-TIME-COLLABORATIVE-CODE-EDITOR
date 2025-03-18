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
    <div className="join-requests">
      <h3>Join Requests</h3>
      {requests.length === 0 && <p>No pending requests.</p>}
      {requests.map((req) => (
        <div key={req.requesterId}>
          <span>{req.user.name} wants to join</span>
          <button onClick={() => respond(req.requesterId, true)}>
            Accept
          </button>
          <button onClick={() => respond(req.requesterId, false)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};

export default JoinRequests;