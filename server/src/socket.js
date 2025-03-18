const users = {};       // Map socket.id -> roomId
const roomCode = {};    // Store latest code per room
const onlineUsers = {}; // Track online users per room

// NEW: Store the admin info per room and pending join requests.
const roomAdmins = {};      // roomId -> { socketId, user }
const pendingRequests = {}; // requesterSocketId -> { roomId, user }

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a socket wants to join a room, send along roomId and user info.
    socket.on("joinRoom", (data) => {
      // data = { roomId, user } where user contains uid and name.
      const { roomId, user } = data;
      
      // If no admin exists, make the first joiner the admin.
      if (!roomAdmins[roomId]) {
        roomAdmins[roomId] = { socketId: socket.id, user };
        socket.join(roomId);
        users[socket.id] = roomId; // Save mapping for admin
        console.log(`Room ${roomId} created by admin ${user.name}`);
        // notify the socket that they are admin
        socket.emit("roomAdminStatus", { isAdmin: true });
      } else {
        // If the joining user is the admin rejoining (by uid), allow rejoin.
        if (roomAdmins[roomId].user.uid === user.uid) {
          socket.join(roomId);
          users[socket.id] = roomId; // Save mapping for admin rejoin
          socket.emit("roomAdminStatus", { isAdmin: true });
        } else {
          // Otherwise, store a pending request and notify the admin.
          pendingRequests[socket.id] = { roomId, user };
          io.to(roomAdmins[roomId].socketId).emit("joinRequest", {
            requesterId: socket.id,
            user
          });
          console.log(`User ${user.name} requested to join room ${roomId}`);
        }
      }
    });

    // Admin responds to a join request.
    socket.on("respondJoinRequest", (data) => {
      // data = { requesterId, accepted }
      const request = pendingRequests[data.requesterId];
      if (request) {
        const roomId = request.roomId;
        const requesterSocket = io.sockets.sockets.get(data.requesterId);
        if (data.accepted) {
          requesterSocket.join(roomId);
          users[data.requesterId] = roomId; // Save mapping when approved
          requesterSocket.emit("joinAccepted", { roomId });
          console.log(
            `Admin approved join request for ${request.user.name} in room ${roomId}`
          );
        } else {
          requesterSocket.emit("joinRejected", { roomId });
          console.log(
            `Admin rejected join request for ${request.user.name} in room ${roomId}`
          );
        }
        delete pendingRequests[data.requesterId];
      }
    });

    // Listen for code changes (unchanged)
    socket.on("codeChange", ({ code }) => {
      const roomId = users[socket.id] || null;
      if (roomId) {
        roomCode[roomId] = typeof code === "string" ? code : "";
        socket.to(roomId).emit("codeUpdate", roomCode[roomId]);
      }
    });

    // Handle disconnections.
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      // Remove from any onlineUsers list.
      let roomId = null;
      for (const id in onlineUsers) {
        onlineUsers[id] = onlineUsers[id].filter((userId) => userId !== socket.id);
      }
      // Remove pending join request if exists.
      if (pendingRequests[socket.id]) {
        delete pendingRequests[socket.id];
      }
      // If an admin disconnects, you might want to reassign a new admin here.
      for (const room in roomAdmins) {
        if (roomAdmins[room].socketId === socket.id) {
          console.log(`Admin of room ${room} disconnected.`);
          delete roomAdmins[room];
          // Optionally, notify others in the room or reassign admin.
        }
      }
      // Optionally, remove the user's room mapping.
      delete users[socket.id];
    });
  });
}