export function chatSocket(io) {
  let waitingUsers = []; // file d'attente pour le matching
  const users = {}; // id -> socket

  io.on("connection", (socket) => {
    console.log("⚡ Utilisateur connecté :", socket.id);
    users[socket.id] = socket;

    socket.on("findMatch", () => {
      console.log(`🔍 ${socket.id} cherche un match...`);
      console.log("💾 Utilisateurs en attente :", waitingUsers);

      if (waitingUsers.length > 0) {
        const partnerId = waitingUsers.shift();
        console.log(`✅ Match trouvé : ${socket.id} ↔ ${partnerId}`);
        socket.emit("matchFound", { id: partnerId });
        users[partnerId].emit("matchFound", { id: socket.id });
      } else {
        waitingUsers.push(socket.id);
        console.log(`⏳ ${socket.id} mis en attente`);
      }

      console.log("💾 File d'attente actuelle :", waitingUsers);
    });

    socket.on("sendMessage", ({ content, receiverId }) => {
      console.log(`📩 ${socket.id} -> ${receiverId} : ${content}`);
      if (users[receiverId]) {
        users[receiverId].emit("receiveMessage", {
          sender: socket.id,
          content,
        });
      } else {
        console.log(`⚠️ Impossible d'envoyer à ${receiverId} : non connecté`);
      }
    });

    socket.on("disconnect", () => {
      console.log("❌ Utilisateur déconnecté :", socket.id);
      delete users[socket.id];
      waitingUsers = waitingUsers.filter((id) => id !== socket.id);
      console.log("💾 File d'attente mise à jour :", waitingUsers);
    });
  });
}
