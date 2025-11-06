// frontend/src/socket.js
import { io } from "socket.io-client";

// Lisez la variable VITE_API_URL que vous venez de définir
// process.env.VITE_API_URL sera automatiquement injecté par Vite lors du build.
const VITE_API_URL = import.meta.env.VITE_API_URL; 
const socket = io(VITE_API_URL, {
  withCredentials: true,
});; 

export default socket;