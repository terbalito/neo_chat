// backend/utils/db.js
import mariadb from "mariadb";
import dotenv from "dotenv";
dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  connectionLimit: 5
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
