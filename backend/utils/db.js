// backend/utils/db.js
import mariadb from "mariadb";
import dotenv from "dotenv";

dotenv.config();

// On crée un pool de connexions pour éviter d'ouvrir une nouvelle connexion à chaque requête
const pool = mariadb.createPool({
  host: process.env.DB_HOST,       // Adresse du serveur (ex: localhost)
  user: process.env.DB_USER,       // Nom d'utilisateur
  password: process.env.DB_PASSWORD,   // Mot de passe
  database: process.env.DB_NAME,   // Nom de la base de données
  port: process.env.DB_PORT || 3306, // Port par défaut de MariaDB/MySQL
  connectionLimit: 5               // Nombre max de connexions simultanées
});

// Fonction pour tester la connexion au démarrage du serveur
export async function createConnection() {
  try {
    const conn = await pool.getConnection();
    console.log("✅ Connexion à la base MariaDB réussie !");
    conn.release(); // On libère la connexion après test
  } catch (err) {
    console.error("❌ Erreur connexion BDD:", err);
  }
}

// On exporte le pool pour être utilisé dans les autres fichiers
export default pool;
