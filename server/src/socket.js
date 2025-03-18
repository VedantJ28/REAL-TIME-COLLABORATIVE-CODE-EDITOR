const users = {};       // Map socket.id -> roomId
const roomCode = {};    // Store latest code per room
const onlineUsers = {}; // Track online users per room

// NEW: Store the admin info per room and pending join requests.
const roomAdmins = {};      // roomId -> { socketId, user }
const pendingRequests = {}; // requesterSocketId -> { roomId, user }

const cursorPositions = {}; // Store cursor positions per room

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // When a socket wants to join a room, send along roomId and user info.
    socket.on("joinRoom", (data) => {
      const { roomId, user } = data;

      // If no admin exists, make the first joiner the admin.
      if (!roomAdmins[roomId]) {
        roomAdmins[roomId] = { socketId: socket.id, user };
        socket.join(roomId);
        users[socket.id] = roomId; // Save mapping for admin
        console.log(`Room ${roomId} created by admin ${user.name}`);
        socket.emit("roomAdminStatus", { isAdmin: true });
      } else {
        if (roomAdmins[roomId].user.uid === user.uid) {
          socket.join(roomId);
          users[socket.id] = roomId; // Save mapping for admin rejoin
          socket.emit("roomAdminStatus", { isAdmin: true });
        } else {
          pendingRequests[socket.id] = { roomId, user };
          io.to(roomAdmins[roomId].socketId).emit("joinRequest", {
            requesterId: socket.id,
            user,
          });
          console.log(`User ${user.name} requested to join room ${roomId}`);
        }
      }
    });

    // Admin responds to a join request.
    socket.on("respondJoinRequest", (data) => {
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

    // Listen for code changes
    socket.on("codeChange", ({ code }) => {
      const roomId = users[socket.id] || null;
      if (roomId) {
        roomCode[roomId] = typeof code === "string" ? code : "";
        socket.to(roomId).emit("codeUpdate", roomCode[roomId]);
      }
    });

    // NEW: Listen for cursor position updates
    socket.on("cursorPosition", ({ roomId, user, position }) => {
      if (!cursorPositions[roomId]) {
        cursorPositions[roomId] = {};
      }
      // Attach the sender's socket id to the user object.
      user.socketId = socket.id;
      cursorPositions[roomId][user.uid] = { user, position };
    
      console.log(`Cursor position updated for user ${user.name}:`, position);
      console.log(`Broadcasting cursor positions for room ${roomId}:`, cursorPositions[roomId]);
    
      // Broadcast the updated cursor positions to everyone except the sender.
      socket.to(roomId).emit("updateCursorPositions", cursorPositions[roomId]);
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      let roomId = null;

      // Remove from onlineUsers list
      for (const id in onlineUsers) {
        onlineUsers[id] = onlineUsers[id].filter((userId) => userId !== socket.id);
      }

      // Remove pending join request if exists
      if (pendingRequests[socket.id]) {
        delete pendingRequests[socket.id];
      }

      // Remove cursor position if exists
      for (const room in cursorPositions) {
        for (const uid in cursorPositions[room]) {
          if (cursorPositions[room][uid].user.socketId === socket.id) {
            delete cursorPositions[room][uid];
          }
        }
      }

      // Notify others in the room about updated cursor positions
      if (roomId && cursorPositions[roomId]) {
        socket.to(roomId).emit("updateCursorPositions", cursorPositions[roomId]);
      }

      // Handle admin disconnection
      for (const room in roomAdmins) {
        if (roomAdmins[room].socketId === socket.id) {
          console.log(`Admin of room ${room} disconnected.`);
          delete roomAdmins[room];
        }
      }

      // Remove user's room mapping
      delete users[socket.id];
    });
  });
}