import React, { useState, useEffect } from "react";
import MatchScreen from "./components/MatchScreen";
import ChatRoom from "./components/ChatRoom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import socket from "./socket"; // ⚠️ IMPORTANT

export default function App() {
  const [partner, setPartner] = useState(null);
  const [user, setUser] = useState(null); // utilisateur connecté
  const [mode, setMode] = useState("login"); // "login" ou "signup"

  // Auto-login si token présent
  useEffect(() => {
    const token = localStorage.getItem("token");
    const pseudo = localStorage.getItem("pseudo");
    if (token && pseudo) {
      setUser({ pseudo, token });
      socket.emit("setPseudo", pseudo); // ⚡ Associer le pseudo au socket
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    socket.emit("setPseudo", userData.pseudo); // ⚡ Ici userData est défini
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("pseudo");
    setUser(null);
    setPartner(null);
  };

  const handleMatched = (partnerObj) => setPartner(partnerObj);
  const handleUnmatched = () => setPartner(null);

  return (
    <div className="app-container">
      {/* --- Étape 1 : Authentification --- */}
      {!user ? (
        <div className="auth-container">
          {mode === "login" ? (
            <>
              <Login onLogin={handleLogin} />
              <p style={{ marginTop: "10px" }}>
                Pas encore de compte ?{" "}
                <button
                  onClick={() => setMode("signup")}
                  className="switch-btn"
                >
                  S'inscrire
                </button>
              </p>
            </>
          ) : (
            <>
              <Signup onSignup={() => setMode("login")} />
              <p style={{ marginTop: "10px" }}>
                Déjà inscrit ?{" "}
                <button
                  onClick={() => setMode("login")}
                  className="switch-btn"
                >
                  Se connecter
                </button>
              </p>
            </>
          )}
        </div>
      ) : (
        // --- Étape 2 : Match / Chat ---
        <>
          <div className="header">
            <p>
              Connecté en tant que <strong>{user.pseudo}</strong>
            </p>
            <button onClick={handleLogout}>Déconnexion</button>
          </div>

          {!partner ? (
            <MatchScreen onMatched={handleMatched} user={user} />
          ) : (
            <ChatRoom
              partner={partner}
              onUnmatched={handleUnmatched}
              user={user}
            />
          )}
        </>
      )}
    </div>
  );
}
