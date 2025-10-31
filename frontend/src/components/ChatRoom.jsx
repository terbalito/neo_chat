// src/components/ChatRoom.jsx
import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import "../styles/chatroom.css";

export default function ChatRoom({ partner, onUnmatched }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log("📥 Écoute des messages entrants");
    socket.on("receiveMessage", (msg) => {
      console.log("📩 Message reçu :", msg);
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("partnerLeft", () => {
      console.log("⚠️ Ton partenaire est parti");
      onUnmatched();
    });

    socket.on("matchFound", (p) => {
      console.log("🔔 Nouveau match reçu !", p);
      if (audioRef.current) audioRef.current.play();
    });

    socket.on("partnerTyping", (typing) => {
      setIsTyping(typing);
    });

    return () => {
      socket.off("receiveMessage");
      socket.off("partnerLeft");
      socket.off("matchFound");
      socket.off("partnerTyping");
    };
  }, [onUnmatched]);

  const sendMessage = () => {
    if (!input.trim()) return;
    console.log("📤 Envoi message :", input);
    socket.emit("sendMessage", { content: input });
    setMessages((prev) => [...prev, { sender: "Moi", content: input }]);
    setInput("");
    socket.emit("typing", false);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit("typing", e.target.value.length > 0);
  };

  const switchPartner = () => {
    console.log("🔁 Demande de switch partenaire");
    socket.emit("switchPartner");
    onUnmatched();
  };

  return (
    <div className="chat-room-neo">
      <audio ref={audioRef} src="/sounds/match.mp3" preload="auto" />
      
      {/* Header */}
      <div className="chat-header">
        <div className="partner-info">
          <div className="partner-avatar"></div>
          <div className="partner-details">
            <h3>{partner?.id || "—"}</h3>
            <span className="status-dot"></span>
            <span className="status-text">En ligne</span>
          </div>
        </div>
        <button className="btn-switch" onClick={switchPartner}>
          <span className="switch-icon">↻</span>
          Changer
        </button>
      </div>

      {/* Messages Area */}
      <div className="messages-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>Commencez la conversation</p>
              <small>Envoyez le premier message</small>
            </div>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={`msg ${m.sender === "Moi" ? "me" : "them"}`}>
                <div className="msg-content">
                  {m.content}
                </div>
                <div className="msg-time">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
              <span>Partenaire est en train d'écrire...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="input-area">
        <div className="input-wrapper">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Écrire un message..."
            onKeyDown={(e) => { 
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            className="message-input"
          />
          <button 
            onClick={sendMessage} 
            className="send-button"
            disabled={!input.trim()}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}