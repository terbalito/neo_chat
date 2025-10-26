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

// ✅ Configuration CORS propre et sécurisée
const allowedOrigins = [
  "http://localhost:5173",       // ton front local
  "http://127.0.0.1:5173",
  "https://neo-chat.vercel.app", // ton futur front hébergé
  "https://*.vercel.app"         // wildcard pour Vercel
];

app.use(cors({
  origin: function (origin, callback) {
    // autorise les requêtes sans "origin" (Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      return callback(null, true);
    } else {
      return callback(new Error("CORS bloqué : origine non autorisée"));
    }
  },
  methods: ["GET", "POST"],
  credentials: true,
}));

app.use(express.json());

// ✅ CORS aussi pour Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// route test
app.get("/", (req, res) => res.send("🟢 Neo Chat Backend Ready"));

// initialisation des sockets
chatSocket(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  await createConnection();
});
