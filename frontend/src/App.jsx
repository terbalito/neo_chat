import React, { useState } from "react";
import MatchScreen from "./components/MatchScreen";
import ChatRoom from "./components/ChatRoom";

export default function App() {
  const [partner, setPartner] = useState(null);

  return (
    <div className="app-container">
      {!partner ? (
        <MatchScreen onMatched={setPartner} />
      ) : (
        <ChatRoom partner={partner} />
      )}
    </div>
  );
}
