// src/components/MatchScreen.jsx
import React, { useEffect } from "react";
import socket from "../socket";
import "../styles/match.css"; // styles d'animation

export default function MatchScreen({ onMatched }) {
  useEffect(() => {
    console.log("▶️ Emission findMatch");
    socket.emit("findMatch");

    socket.on("matchFound", (partner) => {
      console.log("🎉 Match trouvé côté client :", partner);
      onMatched(partner);
    });

    socket.on("searching", () => {
      console.log("🔎 Searching...");
    });

    socket.on("attemptMatch", () => {
      // optional
    });

    return () => {
      socket.off("matchFound");
      socket.off("searching");
      socket.off("attemptMatch");
    };
  }, [onMatched]);

  return (
    <div className="match-screen">
      <div className="spinner-wrap">
        <div className="neo-spinner">
          <div className="bar bar1" />
          <div className="bar bar2" />
          <div className="bar bar3" />
        </div>
        <p className="waiting-text">Recherche d'un partenaire…</p>
      </div>
    </div>
  );
}
