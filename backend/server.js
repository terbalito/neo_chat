import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import { createConnection } from "./utils/db.js";
import { chatSocket } from "./sockets/chatSocket.js";


const app = express();
const server = http.createServer(app);

// Allowed origins
const envOrigins = process.env.ALLOWED_ORIGINS || "";
const allowedOrigins = envOrigins
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  allowedOrigins.push("http://localhost:5173", "http://127.0.0.1:5173");
}

console.log("✅ Allowed origins:", allowedOrigins);

// ----------------------
// CORS middleware **avant les routes**
// ----------------------
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Postman / localhost file requests
    if (allowedOrigins.includes(origin) || allowedOrigins.some(o => o.includes("*") && new RegExp("^" + o.replace(/\*/g, ".*") + "$").test(origin))) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS bloqué : origine non autorisée"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// ----------------------
// Body parser & cookie parser
// ----------------------
app.use(express.json());
app.use(cookieParser());

// ----------------------
// Routes
// ----------------------
app.use("/api/auth", authRoutes);

// ----------------------
// Socket.IO
// ----------------------
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
chatSocket(io);

// Test
app.get("/", (req, res) => res.send("🟢 Neo Chat Backend Ready"));

// ----------------------
// Start server
// ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  await createConnection();
});
