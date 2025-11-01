// backend/routes/authRoutes.js
import express from "express";
import { signup, login, me } from "../controllers/authController.js";
import { authJwt } from "../middleware/authJwt.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authJwt, me); // protégé

export default router;
