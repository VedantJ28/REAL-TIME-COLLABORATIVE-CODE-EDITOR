import { io } from "socket.io-client";

const socket = io("http://localhost:5000"); // Backend URL

export const joinRoom = (roomId) => {
  socket.emit("joinRoom", roomId);
};

export const sendCodeChange = (roomId, code) => {
  socket.emit("codeChange", { roomId, code });
};

export default socket;
