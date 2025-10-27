// backend/server.js
import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import { createConnection } from "./utils/db.js";
import { chatSocket } from "./sockets/chatSocket.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

// Lecture dynamique des origines depuis .env
const envOrigins = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = envOrigins
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// fallback si vide
if (allowedOrigins.length === 0) {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

console.log("✅ Allowed origins:", allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / localhost file requests
    if (allowedOrigins.includes(origin) || allowedOrigins.some(o => {
      // support simple wildcard like https://*.vercel.app
      return o.includes("*") && new RegExp("^" + o.replace(/\*/g, ".*") + "$").test(origin);
    })) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS bloqué : origine non autorisée"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.get("/", (req, res) => res.send("🟢 Neo Chat Backend Ready"));

chatSocket(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  await createConnection();
});
