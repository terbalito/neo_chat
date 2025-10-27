// backend/sockets/chatSocket.js
export function chatSocket(io) {
  let waitingUsers = []; // queue FIFO
  const users = {}; // socketId -> socket
  const matches = new Map(); // socketId -> partnerSocketId

  io.on("connection", (socket) => {
    console.log("⚡ Utilisateur connecté :", socket.id);
    users[socket.id] = socket;

    // Cherche un match
    socket.on("findMatch", () => {
      console.log(`🔍 ${socket.id} cherche un match...`);
      // ignore si déjà matché
      if (matches.has(socket.id)) {
        console.log(`⚠️ ${socket.id} est déjà matché avec ${matches.get(socket.id)}`);
        return;
      }

      // si file non vide, pop et match
      while (waitingUsers.length > 0) {
        const partnerId = waitingUsers.shift();
        if (!users[partnerId] || partnerId === socket.id) continue;
        // si partner déjà matché, skip
        if (matches.has(partnerId)) continue;

        // garder les matches dans les deux sens
        matches.set(socket.id, partnerId);
        matches.set(partnerId, socket.id);

        console.log(`✅ Match trouvé : ${socket.id} ↔ ${partnerId}`);
        socket.emit("matchFound", { id: partnerId });
        users[partnerId].emit("matchFound", { id: socket.id });
        return;
      }

      // sinon on met en attente
      waitingUsers.push(socket.id);
      console.log(`⏳ ${socket.id} mis en attente`);
      console.log("💾 File d'attente actuelle :", waitingUsers);
    });

    // Demande pour switcher / quitter partenaire et retrouver un match
    socket.on("switchPartner", () => {
      console.log(`🔁 ${socket.id} demande à switcher`);
      const partnerId = matches.get(socket.id);
      if (partnerId) {
        // notifie le partenaire qu'il a été lâché
        if (users[partnerId]) {
          users[partnerId].emit("partnerLeft");
        }
        // supprimer le match des deux côtés
        matches.delete(socket.id);
        matches.delete(partnerId);
        console.log(`🗑️ Match supprimé: ${socket.id} ↔ ${partnerId}`);
      }

      // met le socket en recherche immédiate
      // assure-toi d'enlever s'il était dans la file d'attente
      waitingUsers = waitingUsers.filter(id => id !== socket.id);
      waitingUsers.push(socket.id);
      console.log(`⏳ ${socket.id} remis en attente`);
      console.log("💾 File d'attente actuelle :", waitingUsers);

      // tenter un match immédiat (si quelqu'un attend)
      socket.emit("searching");
      socket.emit("attemptMatch"); // côté client juste log si besoin
      // essayer de matcher à nouveau (pour cas où quelqu'un est déjà en attente)
      socket.emit("findMatch");
    });

    // Serve message -> envoie direct au partenaire si existant
    socket.on("sendMessage", ({ content }) => {
      const partnerId = matches.get(socket.id);
      if (partnerId && users[partnerId]) {
        console.log(`📩 ${socket.id} -> ${partnerId}: ${content}`);
        users[partnerId].emit("receiveMessage", { sender: socket.id, content });
      } else {
        console.log(`⚠️ ${socket.id} essaye d'envoyer mais n'a pas de partner`);
        socket.emit("noPartner");
      }
    });

    // support client pour quitter proprement la file d'attente
    socket.on("leaveQueue", () => {
      waitingUsers = waitingUsers.filter(id => id !== socket.id);
      socket.emit("leftQueue");
      console.log(`🚪 ${socket.id} a quitté la file d'attente`);
    });

    socket.on("disconnect", () => {
      console.log("❌ Utilisateur déconnecté :", socket.id);
      // si match existait, prévenir l'autre
      const partner = matches.get(socket.id);
      if (partner && users[partner]) {
        users[partner].emit("partnerLeft");
        matches.delete(partner);
      }
      matches.delete(socket.id);

      // retirer de la file d'attente
      waitingUsers = waitingUsers.filter(id => id !== socket.id);
      delete users[socket.id];

      console.log("💾 File d'attente mise à jour :", waitingUsers);
    });
  });
}
