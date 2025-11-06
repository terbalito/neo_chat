// backend/utils/db.js
import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

console.log("📦 Configuration base de données :", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  connectionLimit: 5,
});

export async function createConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connexion à la base MariaDB réussie !");
    conn.release();
  } catch (err) {
    console.error("❌ Erreur connexion BDD:", err);
  }
}

export default pool;
