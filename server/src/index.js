import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import setupSocket from "./socket.js";
import { saveChatMessage } from "./chat.js";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
app.use(express.json());

// Setup WebSockets
setupSocket(io);

// REST API for sending chat messages
app.post("/chat/send", async (req, res) => {
  const { roomId, user, message } = req.body;
  if (!roomId || !user || !message) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  await saveChatMessage(roomId, user, message);
  io.to(roomId).emit("newMessage", { user, message });

  res.status(200).json({ success: true });
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
