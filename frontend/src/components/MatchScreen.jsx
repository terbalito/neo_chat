// src/components/MatchScreen.jsx
import React, { useEffect, useState } from "react";
import socket from "../socket";
import "../styles/match.css";

export default function MatchScreen({ onMatched }) {
  const [searchTime, setSearchTime] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    connectedCount: 0,
    conversationsCount: 0,
  });

  useEffect(() => {
    let timer;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setSearchTime(0);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  useEffect(() => {
    socket.on("statsUpdate", (data) => {
      setStats(data);
    });

    socket.on("matchFound", (partner) => {
      setIsSearching(false);
      onMatched(partner);
    });

    socket.on("searching", () => setIsSearching(true));
    socket.on("searchCancelled", () => setIsSearching(false));

    socket.emit("getStats");

    return () => {
      socket.off("statsUpdate");
      socket.off("matchFound");
      socket.off("searching");
      socket.off("searchCancelled");
    };
  }, [onMatched]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSearch = () => {
    setIsSearching(true);
    setSearchTime(0);
    socket.emit("findMatch");
  };

  const cancelSearch = () => {
    socket.emit("cancelSearch");
    setIsSearching(false);
  };

  return (
    <div className="match-screen">
      <div className="match-container">
        {/* Header */}
        <div className="match-header">
          <h1 className="match-title">Trouver un Partenaire</h1>
          <div className="search-time">
            <span className="time-icon">⏱</span>
            {formatTime(searchTime)}
          </div>
        </div>

        {/* Radar Animation */}
        <div className="search-animation">
          <div className="radar-container">
            <div className="radar">
              <div className="radar-sweep"></div>
            </div>
            <div className="pulse-dots">
              <div className="pulse-dot dot-1"></div>
              <div className="pulse-dot dot-2"></div>
              <div className="pulse-dot dot-3"></div>
              <div className="pulse-dot dot-4"></div>
            </div>
          </div>

          <div className="avatar-stack">
            <div className="avatar-circle avatar-1"><span>👤</span></div>
            <div className="avatar-circle avatar-2"><span>👤</span></div>
            <div className="avatar-circle avatar-3"><span>👤</span></div>
            <div className="avatar-circle avatar-4"><span>👤</span></div>
          </div>
        </div>

        {/* Stats */}
        <div className="search-stats">
          <div className="stat-item">
            <span className="stat-number">{stats.totalUsers}</span>
            <span className="stat-label">Utilisateurs inscrits</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.connectedCount}</span>
            <span className="stat-label">En ligne</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.conversationsCount}</span>
            <span className="stat-label">Conversations actives</span>
          </div>
        </div>

        {/* Status */}
        <div className="search-status">
          <div className="status-indicator">
            <div
              className={`status-dot ${isSearching ? "searching" : "found"}`}
            ></div>
            <span className="status-text">
              {isSearching ? "Recherche en cours..." : "En attente"}
            </span>
          </div>
        </div>

        {/* Boutons */}
        <div className="actions">
          {!isSearching ? (
            <button className="start-btn" onClick={handleSearch}>
              🔍 Lancer la recherche
            </button>
          ) : (
            <button className="cancel-btn" onClick={cancelSearch}>
              ✕ Annuler la recherche
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="encouragement-messages">
          <p className="encouragement-text">
            {searchTime < 10 && "Recherche de partenaires compatibles..."}
            {searchTime >= 10 &&
              searchTime < 20 &&
              "Encore un peu de patience..."}
            {searchTime >= 20 &&
              "Vous êtes prioritaire dans la file d'attente!"}
          </p>
        </div>
      </div>
    </div>
  );
}
