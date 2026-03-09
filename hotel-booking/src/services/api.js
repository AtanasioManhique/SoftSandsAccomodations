// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Em desenvolvimento: usa o proxy do Vite ("/api" → localhost:3000)
// Em produção (Vercel): usa a URL real do backend via variável
// de ambiente VITE_API_URL.
//
// No Vercel, adiciona a variável de ambiente:
//   VITE_API_URL = https://teu-backend.onrender.com/api
//   (ou o URL real do backend do teu amigo)
// ─────────────────────────────────────────────────────────────

import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
export { api };