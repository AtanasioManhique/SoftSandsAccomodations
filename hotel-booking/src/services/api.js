// src/services/api.js
import axios from "axios";

// Criamos uma instância do axios configurada para o nosso backend
export const api = axios.create({
  baseURL: "http://localhost:3000/api", // URL base da tua API (futuro backend)
  timeout: 10000, // tempo máximo de espera (em ms) antes de dar erro (10s)
  headers: {
    "Content-Type": "application/json", // tipo de dado padrão que será enviado
  },
});

// INTERCEPTOR de requisição (opcional mas muito útil futuramente com login)
api.interceptors.request.use(
  (config) => {
    // Caso tenhas token de autenticação guardado
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
