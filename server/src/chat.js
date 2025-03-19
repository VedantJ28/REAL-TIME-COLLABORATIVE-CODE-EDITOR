import { createClient } from "redis";
import dotenv from "dotenv";

dotenv.config();

// Create Redis client with provided connection details
const redisClient = createClient({
  username: "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

// Connect to Redis
await redisClient.connect();

export async function saveChatMessage(roomId, user, message) {
  try {
    const chatMessage = JSON.stringify({
      user,
      text: message,
      timestamp: Date.now(),
    });

    // Save to Redis
    await redisClient.rPush(`room:${roomId}:messages`, chatMessage);
  } catch (error) {
    console.error("Error saving chat message to Redis:", error);
  }
}

export async function getChatMessages(roomId) {
  try {
    // Retrieve messages from Redis
    const messages = await redisClient.lRange(`room:${roomId}:messages`, 0, -1);
    return messages.map((msg) => JSON.parse(msg));
  } catch (error) {
    console.error("Error retrieving chat messages from Redis:", error);
    return [];
  }
}

export async function deleteChatMessages(roomId) {
  try {
    // Delete messages from Redis
    await redisClient.del(`room:${roomId}:messages`);
    console.log(`All chat messages for room ${roomId} have been deleted from Redis.`);
  } catch (error) {
    console.error("Error deleting chat messages from Redis:", error);
  }
}