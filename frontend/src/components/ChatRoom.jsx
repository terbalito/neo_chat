import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import socket from "../../socket";

// const socket = io("http://localhost:5000");

export default function ChatRoom({ partner }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    console.log("📥 Écoute des messages entrants");
    socket.on("receiveMessage", (msg) => {
      console.log("📩 Message reçu :", msg);
      setMessages((prev) => [...prev, msg]);
    });

    return () => socket.off("receiveMessage");
  }, []);

  const sendMessage = () => {
    if (!input) return;
    console.log("📤 Envoi message :", input, "à", partner.id);
    socket.emit("sendMessage", { content: input, receiverId: partner.id });
    setMessages((prev) => [...prev, { sender: "Moi", content: input }]);
    setInput("");
  };

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <p key={i}><b>{m.sender}:</b> {m.content}</p>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Écrire un message..."
      />
      <button onClick={sendMessage}>Envoyer</button>
    </div>
  );
}
