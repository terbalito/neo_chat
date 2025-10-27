// src/components/ChatRoom.jsx
import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import "../styles/chatroom.css"; // includes button styles and match animation

export default function ChatRoom({ partner, onUnmatched }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const audioRef = useRef(null);

  useEffect(() => {
    console.log("📥 Écoute des messages entrants");
    socket.on("receiveMessage", (msg) => {
      console.log("📩 Message reçu :", msg);
      setMessages((prev) => [...prev, msg]);
    });

    // si le partner left côté serveur
    socket.on("partnerLeft", () => {
      console.log("⚠️ Ton partenaire est parti");
      // éventuellement informer l'utilisateur et revenir au matching
      onUnmatched();
    });

    // quand on reçoit match (en cas de re-match)
    socket.on("matchFound", (p) => {
      console.log("🔔 Nouveau match reçu !", p);
      // joue le son
      if (audioRef.current) audioRef.current.play();
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("partnerLeft");
      socket.off("matchFound");
    };
  }, [onUnmatched]);

  const sendMessage = () => {
    if (!input.trim()) return;
    console.log("📤 Envoi message :", input);
    socket.emit("sendMessage", { content: input });
    setMessages((prev) => [...prev, { sender: "Moi", content: input }]);
    setInput("");
  };

  const switchPartner = () => {
    // demarque : on notifie le serveur qu'on veut changer
    console.log("🔁 Demande de switch partenaire");
    socket.emit("switchPartner");
    // on retourne au flow de matching côté UI
    onUnmatched();
  };

  return (
    <div className="chat-room-neo">
      <audio ref={audioRef} src="/sounds/match.mp3" preload="auto" />
      <div className="chat-header">
        <h3>Partner: {partner?.id ?? "—"}</h3>
        <button className="btn-switch" onClick={switchPartner}>Changer de partenaire</button>
      </div>

      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.sender === "Moi" ? "me" : "them"}`}>
            <strong>{m.sender === "Moi" ? "Moi" : m.sender}:</strong> {m.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrire un message..."
          onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
        />
        <button onClick={sendMessage}>Envoyer</button>
      </div>
    </div>
  );
}
