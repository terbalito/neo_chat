import React, { useEffect } from "react";
import { io } from "socket.io-client";
import socket from "../../socket";

// const socket = io("http://localhost:5000");

export default function MatchScreen({ onMatched }) {
  useEffect(() => {
    console.log("▶️ Emission findMatch");
    socket.emit("findMatch");

    socket.on("matchFound", (partner) => {
      console.log("🎉 Match trouvé côté client :", partner);
      onMatched(partner);
    });

    return () => {
      socket.off("matchFound");
    };
  }, []);

  return (
    <div className="match-screen">
      <h1>🎯 Trouvons ton match...</h1>
      <p>Attends un instant ⏳</p>
    </div>
  );
}
