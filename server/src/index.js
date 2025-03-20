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

// Use the explicit allowed origin for your client:

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://real-time-collaborative-code-editor-gray.vercel.app");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );
  next();
});

const allowedOrigin = "https://real-time-collaborative-code-editor-gray.vercel.app";

// Express CORS middleware
const options = [
  cors({
    origin: allowedOrigin,
    methods: '*',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
];

app.use(options);

// Configure Socket.IO with CORS settings matching the client:
const io = new Server(server, {
  cors:{
    origin: allowedOrigin,
    methods: ["GET", "POST"],
    credentials: true,
  }
});

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

app.get('/', (req, res) => {
  res.send("Hello World");
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});