// src/components/Auth.jsx
import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";

export default function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);

  const switchMode = () => setIsLogin((prev) => !prev);

  return (
    <div className="auth-wrapper">
      {isLogin ? (
        <Login onLogin={onAuth} switchMode={switchMode} />
      ) : (
        <Signup onSignup={switchMode} switchMode={switchMode} />
      )}

      <button
        onClick={switchMode}
        className="switch-btn"
        style={{
          marginTop: "1rem",
          background: "none",
          color: "#007bff",
          border: "none",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        {isLogin ? "Créer un compte" : "Déjà un compte ? Se connecter"}
      </button>
    </div>
  );
}
