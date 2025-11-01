// src/components/Login.jsx
import React, { useState } from "react";
import axios from "axios";

export default function Login({ onLogin }) {
  const [formData, setFormData] = useState({ pseudo: "", password: "" });
  const [message, setMessage] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("pseudo", formData.pseudo);
      onLogin({ pseudo: formData.pseudo, token: res.data.token });
    } catch (err) {
      setMessage(err.response?.data?.message || "Erreur serveur");
    }
  };

  return (
    <div className="auth-container">
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="pseudo"
          placeholder="Pseudo"
          value={formData.pseudo}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <button type="submit">Se connecter</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}
