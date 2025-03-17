import { db } from "./firebase.js";
import admin from "firebase-admin";

export async function saveChatMessage(roomId, user, message) {
  try {
    await db.collection("rooms").doc(roomId).collection("messages").add({
      user: user,
      text: message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving chat message:", error);
  }
}
