const users = {};    // Map socket.id -> roomId
const roomCode = {}; // Store latest code per room
const onlineUsers = {}; // Track online users per room

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Assign user to a room
    socket.on("joinRoom", (roomId) => {
      socket.join(roomId);
      users[socket.id] = roomId;

      // Add the user to the onlineUsers list for the room
      if (!onlineUsers[roomId]) {
        onlineUsers[roomId] = [];
      }
      // Using socket.id as the user identifier; replace it with a username if available
      onlineUsers[roomId].push(socket.id);

      // Emit updated list of online users to everyone in the room
      io.to(roomId).emit("updateUsers", onlineUsers[roomId]);

      // Send the latest code state of this room to the new user
      if (roomCode[roomId]) {
        socket.emit("init", roomCode[roomId]);
      } else {
        roomCode[roomId] = "";
      }

      console.log(`User ${socket.id} joined room ${roomId}`);
    });

    // Listen for code changes
    socket.on("codeChange", ({ code }) => {
      const roomId = users[socket.id];
      if (roomId) {
        roomCode[roomId] = typeof code === "string" ? code : "";
        socket.to(roomId).emit("codeUpdate", roomCode[roomId]);
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      const roomId = users[socket.id];
      delete users[socket.id];

      // Remove the user from onlineUsers and emit the updated list
      if (roomId && onlineUsers[roomId]) {
        onlineUsers[roomId] = onlineUsers[roomId].filter(
          (user) => user !== socket.id
        );
        io.to(roomId).emit("updateUsers", onlineUsers[roomId]);

        // Optional: Clean up empty rooms
        if (onlineUsers[roomId].length === 0) {
          delete onlineUsers[roomId];
          delete roomCode[roomId];
        }
      }
    });
  });
}