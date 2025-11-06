// backend/sockets/chatSocket.js
import pool from "../utils/db.js";

export function chatSocket(io) {
  let waitingUsers = [];
  const users = {}; // socket.id -> socket
  const matches = new Map(); // socket.id -> partnerSocketId

  // 🔥 Fonction pour envoyer les stats globales à tous les clients
  async function broadcastStats() {
    try {
      const rows = await pool.query("SELECT COUNT(*) AS total FROM users");
      const totalUsers = Number(rows[0]?.total || 0);

      console.log("👥 Nombre total d’utilisateurs en base :", totalUsers);

      const connectedCount = Object.keys(users).length;
      const conversationsCount = matches.size / 2;

      // ✅ On évite d’envoyer des BigInt ici
      io.emit("statsUpdate", {
        totalUsers,
        connectedCount,
        conversationsCount,
      });
    } catch (error) {
      console.error("❌ Erreur lors du comptage des stats :", error);
    }
  }

  // 🔎 Trouver un partenaire
  async function trouverPartenairePour(socketId) {
    const otherSocketId = waitingUsers.find(
      (id) => id !== socketId && !matches.has(id)
    );

    if (!otherSocketId) {
      if (!waitingUsers.includes(socketId)) waitingUsers.push(socketId);
      return null;
    }

    waitingUsers = waitingUsers.filter(
      (id) => id !== otherSocketId && id !== socketId
    );

    matches.set(socketId, otherSocketId);
    matches.set(otherSocketId, socketId);

    const partnerSocket = users[otherSocketId];
    const partnerPseudo = partnerSocket?.pseudo || "Anonyme";

    await broadcastStats();
    return { id: otherSocketId, pseudo: partnerPseudo, socketId: otherSocketId };
  }

  io.on("connection", (socket) => {
    console.log("⚡ Utilisateur connecté :", socket.id);
    users[socket.id] = socket;
    broadcastStats();

    socket.on("setPseudo", (pseudo) => {
      socket.pseudo = pseudo;
    });

    socket.on("findMatch", async () => {
      const partner = await trouverPartenairePour(socket.id);
      if (partner) {
        io.to(socket.id).emit("matchFound", {
          id: partner.id,
          pseudo: partner.pseudo,
        });
        io.to(partner.socketId).emit("matchFound", {
          id: socket.id,
          pseudo: socket.pseudo || "Anonyme",
        });
      } else {
        socket.emit("searching");
      }
      broadcastStats();
    });

    socket.on("cancelSearch", () => {
      waitingUsers = waitingUsers.filter((id) => id !== socket.id);
      socket.emit("searchCancelled");
      broadcastStats();
    });

    socket.on("sendMessage", ({ content }) => {
      const partnerId = matches.get(socket.id);
      if (partnerId && users[partnerId]) {
        const senderPseudo = socket.pseudo || "Moi";
        users[partnerId].emit("receiveMessage", {
          sender: senderPseudo,
          content,
        });
        socket.emit("receiveMessage", {
          sender: "Moi",
          content,
        });
        console.log(`📩 ${senderPseudo} -> ${partnerId}: ${content}`);
      }
    });

    socket.on("typing", (isTyping) => {
      const partnerId = matches.get(socket.id);
      if (partnerId && users[partnerId]) {
        users[partnerId].emit("partnerTyping", isTyping);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Utilisateur déconnecté :", socket.id);
      const partnerId = matches.get(socket.id);
      if (partnerId && users[partnerId]) {
        users[partnerId].emit("partnerLeft");
        matches.delete(partnerId);
      }
      matches.delete(socket.id);
      waitingUsers = waitingUsers.filter((id) => id !== socket.id);
      delete users[socket.id];
      broadcastStats();
    });
  });
}
