// backend/middleware/authJwt.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

export function authJwt(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.cookies?.token;
    if (!authHeader) return res.status(401).json({ message: "Token manquant" });

    // header format: "Bearer TOKEN"
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : authHeader;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // on attache l'info user à la requête
    req.user = { id: decoded.id, pseudo: decoded.pseudo };
    next();
  } catch (err) {
    console.error("authJwt error:", err);
    return res.status(401).json({ message: "Token invalide" });
  }
}
