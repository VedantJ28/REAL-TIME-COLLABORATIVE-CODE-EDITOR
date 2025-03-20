import { io } from "socket.io-client";

const socket = io("https://real-time-collaborative-code-editor-21nk.onrender.com");

export const joinRoom = (roomId, user) => {
  console.log("Joining room:", { roomId, user }); // Debug log
  socket.emit("joinRoom", { roomId, user });
};

export const sendCodeChange = (roomId, code) => {
  console.log("Sending code change to server:", { roomId, code }); // Debug log
  socket.emit("codeChange", { roomId, code });
};

export const sendCursorPosition = (roomId, user, position) => {
  console.log("Sending cursor position to server:", { roomId, user, position }); // Debug log
  socket.emit("cursorPosition", { roomId, user, position });
};

export default socket;