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

// Allow only the specific origin of your client
const allowedOrigins = [
  "https://real-time-collaborative-code-editor-gray.vercel.app",
];

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // Allow cookies and credentials
}));

// Configure Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "https://real-time-collaborative-code-editor-gray.vercel.app",
    methods: ["GET", "POST"],
    credentials: true, // Allow cookies and credentials
  },
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