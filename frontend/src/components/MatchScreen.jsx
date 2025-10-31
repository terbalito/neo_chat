// src/components/MatchScreen.jsx
import React, { useEffect, useState } from "react";
import socket from "../socket";
import "../styles/match.css";

export default function MatchScreen({ onMatched }) {
  const [searchTime, setSearchTime] = useState(0);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    let timer;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSearching]);

  useEffect(() => {
    console.log("▶️ Emission findMatch");
    setIsSearching(true);
    setSearchTime(0);
    socket.emit("findMatch");

    socket.on("matchFound", (partner) => {
      console.log("🎉 Match trouvé côté client :", partner);
      setIsSearching(false);
      onMatched(partner);
    });

    socket.on("searching", () => {
      console.log("🔎 Searching...");
      setIsSearching(true);
    });

    socket.on("attemptMatch", () => {
      console.log("🔄 Tentative de match...");
    });

    return () => {
      socket.off("matchFound");
      socket.off("searching");
      socket.off("attemptMatch");
    };
  }, [onMatched]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const cancelSearch = () => {
    console.log("❌ Annulation de la recherche");
    socket.emit("cancelSearch");
    setIsSearching(false);
    // Optionnel: retour à l'écran précédent
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

        {/* Animation de recherche */}
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
            <div className="avatar-circle avatar-1">
              <span>👤</span>
            </div>
            <div className="avatar-circle avatar-2">
              <span>👤</span>
            </div>
            <div className="avatar-circle avatar-3">
              <span>👤</span>
            </div>
            <div className="avatar-circle avatar-4">
              <span>👤</span>
            </div>
          </div>
        </div>

        {/* Statut et indicateurs */}
        <div className="search-status">
          <div className="status-indicator">
            <div className={`status-dot ${isSearching ? 'searching' : 'found'}`}></div>
            <span className="status-text">
              {isSearching ? "Recherche en cours..." : "Partenaire trouvé!"}
            </span>
          </div>
          
          <div className="search-stats">
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Utilisateurs en ligne</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">95%</span>
              <span className="stat-label">Match rapide</span>
            </div>
          </div>
        </div>

        {/* Messages d'encouragement */}
        <div className="encouragement-messages">
          <p className="encouragement-text">
            {searchTime < 10 && "Recherche de partenaires compatibles..."}
            {searchTime >= 10 && searchTime < 20 && "Encore un peu de patience..."}
            {searchTime >= 20 && "Vous êtes prioritaire dans la file d'attente!"}
          </p>
        </div>

        {/* Bouton d'annulation */}
        <button 
          className="cancel-btn"
          onClick={cancelSearch}
        >
          <span className="cancel-icon">✕</span>
          Annuler la recherche
        </button>

        {/* Ancien spinner (conservé pour compatibilité) */}
        <div className="spinner-wrap legacy">
          <div className="neo-spinner">
            <div className="bar bar1" />
            <div className="bar bar2" />
            <div className="bar bar3" />
          </div>
          <p className="waiting-text">Recherche d'un partenaire…</p>
        </div>
      </div>
    </div>
  );
}