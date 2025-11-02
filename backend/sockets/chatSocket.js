// backend/sockets/chatSocket.js
import pool from "../utils/db.js"; // pour récupérer infos utilisateurs depuis la DB si besoin

export function chatSocket(io) {
  let waitingUsers = []; // queue FIFO
  const users = {}; // socketId -> socket
  const matches = new Map(); // socketId -> partnerSocketId

  // fonction pour trouver un partenaire
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
    let partnerPseudo = partnerSocket?.pseudo;

    if (!partnerPseudo) {
      try {
        const rows = await pool.query(
          "SELECT pseudo FROM users WHERE id = ?",
          [otherSocketId]
        );
        partnerPseudo = rows[0]?.pseudo || "Anonyme";
      } catch (err) {
        console.error("Erreur récupération pseudo :", err);
        partnerPseudo = "Anonyme";
      }
    }

    return {
      id: otherSocketId,
      pseudo: partnerPseudo,
      socketId: otherSocketId,
    };
  }

  io.on("connection", (socket) => {
    console.log("⚡ Utilisateur connecté :", socket.id);
    users[socket.id] = socket;

    // Optionnel : stocker le pseudo côté socket
    socket.on("setPseudo", (pseudo) => {
      socket.pseudo = pseudo;
    });

    // Cherche un match
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
    });

    // Switch / quitter partenaire
    socket.on("switchPartner", () => {
      const partnerId = matches.get(socket.id);
      if (partnerId && users[partnerId]) {
        users[partnerId].emit("partnerLeft");
      }
      matches.delete(socket.id);
      matches.delete(partnerId);

      waitingUsers = waitingUsers.filter((id) => id !== socket.id);
      waitingUsers.push(socket.id);

      socket.emit("searching");
      socket.emit("attemptMatch");
      socket.emit("findMatch");
    });

    // Envoyer un message
    socket.on("sendMessage", ({ content }) => {
      const partnerId = matches.get(socket.id);
      if (partnerId && users[partnerId]) {
        const senderPseudo = socket.pseudo || "Moi";

        // envoie au partenaire
        users[partnerId].emit("receiveMessage", {
          sender: senderPseudo,
          content,
        });

        // envoie à l'expéditeur (comme confirmation)
        socket.emit("receiveMessage", {
          sender: "Moi",
          content,
        });

        console.log(`📩 ${senderPseudo} -> ${partnerId}: ${content}`);
      } else {
        socket.emit("noPartner");
        console.log(`⚠️ ${socket.id} n'a pas de partner pour envoyer`);
      }
    });

    // Typing indicator
    socket.on("typing", (isTyping) => {
      const partnerId = matches.get(socket.id);
      if (partnerId && users[partnerId]) {
        users[partnerId].emit("partnerTyping", isTyping);
      }
    });

    // Quitter la file
    socket.on("leaveQueue", () => {
      waitingUsers = waitingUsers.filter((id) => id !== socket.id);
      socket.emit("leftQueue");
    });

    // Déconnexion
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
    });
  });
}
