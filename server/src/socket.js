import { saveChatMessage, getChatMessages, deleteChatMessages } from "./chat.js";

const users = {}; // Map socket.id -> roomId
const roomCode = {}; // Store latest code per room
const onlineUsers = {}; // Updated onlineUsers: roomId -> { [socket.id]: userObject }
const roomAdmins = {}; // roomId -> { socketId, user }
const pendingRequests = {}; // requesterSocketId -> { roomId, user }
const cursorPositions = {}; // Store cursor positions per room

// Helper: Emit updated user list for a room.
const emitUpdatedUsers = (io, roomId) => {
  if (onlineUsers[roomId]) {
    const userNames = Object.values(onlineUsers[roomId]).map((u) => u.name);
    // console.log(`Emitting updated users for room ${roomId}:`, userNames);
    io.in(roomId).emit("updateUsers", userNames);
  }
};

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    // console.log(`User connected: ${socket.id}`);

    // When a socket wants to join a room, send along roomId and user info.
    socket.on("joinRoom", async (data) => {
      const { roomId, user } = data;

      // Validate the user object
      if (!user || !user.name || !user.uid) {
        // console.error("Invalid user object:", user);
        socket.emit("error", { message: "Invalid user object" });
        return;
      }

      if (!onlineUsers[roomId]) onlineUsers[roomId] = {};

      // If no admin exists, make the first joiner the admin.
      if (!roomAdmins[roomId]) {
        roomAdmins[roomId] = { socketId: socket.id, user };
        socket.join(roomId);
        users[socket.id] = roomId;
        onlineUsers[roomId][socket.id] = user;
        // console.log(`Room ${roomId} created by admin ${user.name}`);
        socket.emit("roomAdminStatus", { isAdmin: true });

        // Send empty chat history to the admin
        socket.emit("chatHistory", []);
        emitUpdatedUsers(io, roomId);
      } else {
        if (roomAdmins[roomId].user.uid === user.uid) {
          socket.join(roomId);
          users[socket.id] = roomId;
          onlineUsers[roomId][socket.id] = user;
          socket.emit("roomAdminStatus", { isAdmin: true });

          // Send chat history to the admin
          const chatHistory = await getChatMessages(roomId);
          socket.emit("chatHistory", chatHistory);
          emitUpdatedUsers(io, roomId);
        } else {
          pendingRequests[socket.id] = { roomId, user };
          io.to(roomAdmins[roomId].socketId).emit("joinRequest", {
            requesterId: socket.id,
            user,
          });
          // console.log(`User ${user.name} requested to join room ${roomId}`);
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
          users[data.requesterId] = roomId;
          onlineUsers[roomId] = onlineUsers[roomId] || {};
          onlineUsers[roomId][data.requesterId] = request.user;
          requesterSocket.emit("joinAccepted", { roomId, user: request.user });
          // console.log(
          //   `Admin approved join request for ${request.user.name} in room ${roomId}`
          // );
          emitUpdatedUsers(io, roomId);

          // Notify all users except admin about the new user joining
          io.to(roomId).emit("userJoined", { user: request.user });
        } else {
          requesterSocket.emit("joinRejected", { roomId });
          // console.log(
          //   `Admin rejected join request for ${request.user.name} in room ${roomId}`
          // );
        }
        delete pendingRequests[data.requesterId];
      } else {
        // console.error("No pending request found for requesterId:", data.requesterId);
      }
    });

    // Listen for new chat messages
    socket.on("newMessage", async ({ roomId, user, text }) => {
      const message = { user, text, timestamp: Date.now() };

      // Save the message to Redis
      await saveChatMessage(roomId, user, text);

      // Broadcast the message to all users in the room
      io.to(roomId).emit("messageReceived", message);
    });

    // Listen for code changes
    socket.on("codeChange", ({ code }) => {
      const roomId = users[socket.id] || null;
      if (roomId) {
        roomCode[roomId] = typeof code === "string" ? code : "";
        socket.to(roomId).emit("codeUpdate", roomCode[roomId]);
      }
    });

    // Listen for cursor position updates
    socket.on("cursorPosition", ({ roomId, user, position }) => {
      if (!cursorPositions[roomId]) {
        cursorPositions[roomId] = {};
      }
      user.socketId = socket.id;
      cursorPositions[roomId][user.uid] = { user, position };

      // console.log(
      //   `Cursor position updated for user ${user.name}:`,
      //   position
      // );
      // console.log(
      //   `Broadcasting cursor positions for room ${roomId}:`,
      //   cursorPositions[roomId]
      // );
      socket.to(roomId).emit(
        "updateCursorPositions",
        cursorPositions[roomId]
      );
    });

    // Listen for non-admin leaving the room.
    socket.on("leaveRoom", ({ roomId }) => {
      socket.leave(roomId);
      const user = onlineUsers[roomId]?.[socket.id];
      delete users[socket.id];
      if (onlineUsers[roomId]) {
        delete onlineUsers[roomId][socket.id];
        emitUpdatedUsers(io, roomId);

        // Notify all users about the user leaving
        if (user) {
          io.to(roomId).emit("userLeft", { user });
        }
      }
      // console.log(`Socket ${socket.id} left room ${roomId}`);
    });

    // Listen for admin closing the room.
    socket.on("closeRoom", async ({ roomId }) => {
      if (roomAdmins[roomId] && roomAdmins[roomId].socketId === socket.id) {
        io.to(roomId).emit("roomClosed");
        io.in(roomId).socketsLeave(roomId);
        // console.log(`Room ${roomId} closed by admin ${socket.id}`);

        // Delete chat messages for the room
        await deleteChatMessages(roomId);

        delete roomAdmins[roomId];
        if (onlineUsers[roomId]) {
          delete onlineUsers[roomId];
        }
      }
    });

    // Add this below the other socket event listeners
    socket.on("languageChange", ({ roomId, language }) => {
      // console.log(`Language changed to ${language} in room ${roomId}`);
      socket.to(roomId).emit("languageUpdate", { language });
    });

    // Handle disconnections
    socket.on("disconnect", () => {
      // console.log(`User disconnected: ${socket.id}`);
      if (pendingRequests[socket.id]) {
        delete pendingRequests[socket.id];
      }
      for (const room in cursorPositions) {
        for (const uid in cursorPositions[room]) {
          if (cursorPositions[room][uid].user.socketId === socket.id) {
            delete cursorPositions[room][uid];
          }
        }
      }
      for (const room in roomAdmins) {
        if (roomAdmins[room].socketId === socket.id) {
          // console.log(`Admin of room ${room} disconnected.`);
          delete roomAdmins[room];
          if (onlineUsers[room]) {
            delete onlineUsers[room];
            io.in(room).emit("roomClosed");
          }
        }
      }
      const roomId = users[socket.id];
      if (roomId && onlineUsers[roomId]) {
        const user = onlineUsers[roomId][socket.id];
        delete onlineUsers[roomId][socket.id];
        emitUpdatedUsers(io, roomId);

        // Notify all users about the user leaving
        if (user) {
          io.to(roomId).emit("userLeft", { user });
        }
      }
      delete users[socket.id];
    });
  });
}