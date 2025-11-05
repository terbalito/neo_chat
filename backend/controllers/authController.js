// backend/controllers/authController.js
import pool from "../utils/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { randomUUID } from "crypto";

dotenv.config();

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

/**
 * Inscription : reçoit { pseudo, password }
 */
export async function signup(req, res) {
  const { pseudo, password } = req.body;
  if (!pseudo || !password) {
    console.warn("⚠️ Requête signup incomplète :", req.body);
    return res.status(400).json({ message: "Pseudo et mot de passe requis" });
  }

  const id = randomUUID();
  console.log(`🟢 Tentative d’inscription : ${pseudo}`);
  
  let conn; // Déclaré ici pour être accessible dans le bloc finally

  try {
    conn = await pool.getConnection(); // 1. Obtention de la connexion

    // Vérifie si le pseudo existe déjà
    const exists = await conn.query("SELECT id FROM users WHERE pseudo = ?", [pseudo]);
    if (exists.length > 0) {
      console.warn(`⚠️ Pseudo déjà pris : ${pseudo}`);
      return res.status(409).json({ message: "Pseudo déjà pris" });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Ajout des champs createdAt et updatedAt
    const now = new Date();
    await conn.query(
      "INSERT INTO users (id, pseudo, password_hash, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)",
      [id, pseudo, hash, now, now]
    );

    console.log(`✅ Utilisateur créé : ${pseudo} (${id})`);
    return res.status(201).json({ message: "Compte créé" });
  } catch (err) {
    console.error("❌ Erreur signup:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  } finally {
    // 2. CRITIQUE : Relâche la connexion dans tous les cas
    if (conn) conn.release(); 
  }
}

/**
 * Connexion : reçoit { pseudo, password } => renvoie token JWT
 */
export async function login(req, res) {
  const { pseudo, password } = req.body;
  console.log(`🟡 Tentative de connexion : ${pseudo}`);
  
  let conn; // Déclaré ici pour être accessible dans le bloc finally

  try {
    conn = await pool.getConnection(); // 1. Obtention de la connexion
    const rows = await conn.query("SELECT id, password_hash FROM users WHERE pseudo = ?", [pseudo]);
    
    if (!rows || rows.length === 0) {
      console.warn(`❌ Échec connexion : pseudo introuvable (${pseudo})`);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      console.warn(`❌ Mot de passe invalide pour : ${pseudo}`);
      return res.status(401).json({ message: "Identifiants invalides" });
    }

    const token = jwt.sign({ id: user.id, pseudo }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    console.log(`✅ Connexion réussie : ${pseudo}`);

    return res.json({ token, pseudo });
  } catch (err) {
    console.error("🔥 Erreur login:", err);
    return res.status(500).json({ message: "Erreur serveur" });
  } finally {
    // 2. CRITIQUE : Relâche la connexion dans tous les cas
    if (conn) conn.release(); 
  }
}

/**
 * Option : endpoint pour vérifier token (GET /me)
 */
export async function me(req, res) {
  if (!req.user) return res.status(401).json({ message: "Non authentifié" });
  return res.json({ id: req.user.id, pseudo: req.user.pseudo });
}