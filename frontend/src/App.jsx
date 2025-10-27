// src/App.jsx
import React, { useState } from "react";
import MatchScreen from "./components/MatchScreen";
import ChatRoom from "./components/ChatRoom";

export default function App() {
  const [partner, setPartner] = useState(null);

  const handleMatched = (partnerObj) => {
    // partnerObj peut être {id: "..."}
    setPartner(partnerObj);
  };

  const handleUnmatched = () => {
    // when partner leaves or user requests switch -> go back to matching
    setPartner(null);
  };

  return (
    <div className="app-container">
      {!partner ? (
        <MatchScreen onMatched={handleMatched} />
      ) : (
        <ChatRoom partner={partner} onUnmatched={handleUnmatched} />
      )}
    </div>
  );
}
