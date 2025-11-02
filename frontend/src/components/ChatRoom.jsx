/* src/components/ChatRoom.jsx */
import React, { useState, useEffect, useRef } from "react";
import socket from "../socket";
import "../styles/chatroom.css";

export default function ChatRoom({ partner, onUnmatched, user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const audioRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => scrollToBottom(), [messages]);

  useEffect(() => {
    // Écoute des messages entrants
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("partnerLeft", () => {
      onUnmatched();
    });

    socket.on("matchFound", (p) => {
      if (audioRef.current) audioRef.current.play();
    });

    socket.on("partnerTyping", (typing) => setIsTyping(typing));

    return () => {
      socket.off("receiveMessage");
      socket.off("partnerLeft");
      socket.off("matchFound");
      socket.off("partnerTyping");
    };
  }, [onUnmatched]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("sendMessage", { content: input });
    setInput("");
    socket.emit("typing", false);
    // Ne plus faire setMessages ici ! Le backend renverra le message via "receiveMessage"
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    socket.emit("typing", e.target.value.length > 0);
  };

  const switchPartner = () => {
    socket.emit("switchPartner");
    onUnmatched();
  };

  return (
    <div className="chat-room-neo">
      <audio ref={audioRef} src="/sounds/match.mp3" preload="auto" />

      <div className="chat-header">
        <div className="partner-info">
          <div className="partner-avatar"></div>
          <div className="partner-details">
            <h3>{partner?.pseudo || partner?.id || "—"}</h3>
            <span className="status-dot"></span>
            <span className="status-text">En ligne</span>
          </div>
        </div>
      </div>

      <div className="messages-container">
        <div className="messages">
          {messages.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">💬</div>
              <p>Commencez la conversation</p>
              <small>Envoyez le premier message</small>
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.sender === "Moi";
              return (
                <div key={i} className={`msg ${isMe ? "me" : "them"}`}>
                  <div className="msg-content">{m.content}</div>
                  <div className="msg-time">
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              );
            })
          )}
          {isTyping && (
            <div className="typing-indicator">
              <span></span><span></span><span></span>
              <span>Partenaire est en train d'écrire...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
