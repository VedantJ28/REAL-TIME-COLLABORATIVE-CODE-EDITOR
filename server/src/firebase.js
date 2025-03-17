import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const serviceAccount = {
  type: process.env.TYPE.replace(/"/g, "").trim(),
  project_id: process.env.PROJECT_ID.replace(/"/g, "").trim(),
  private_key_id: process.env.PRIVATE_KEY_ID.replace(/"/g, "").trim(),
  private_key: process.env.PRIVATE_KEY.replace(/\\n/g, "\n").replace(/"/g, "").trim(),
  client_email: process.env.CLIENT_EMAIL.replace(/"/g, "").trim(),
  client_id: process.env.CLIENT_ID.replace(/"/g, "").trim(),
  auth_uri: process.env.AUTH_URI.replace(/"/g, "").trim(),
  token_uri: process.env.TOKEN_URI.replace(/"/g, "").trim(),
  auth_provider_x509_cert_url: process.env.AUTH_PROVIDER_CERT_URL.replace(/"/g, "").trim(),
  client_x509_cert_url: process.env.CLIENT_CERT_URL.replace(/"/g, "").trim(),
  universe_domain: process.env.UNIVERSE_DOMAIN.replace(/"/g, "").trim()
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const db = admin.firestore();