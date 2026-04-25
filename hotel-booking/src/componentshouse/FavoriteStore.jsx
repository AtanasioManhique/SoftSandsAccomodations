// componentshouse/FavoriteStore.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);

 
  const storageKey = user?.email
    ? `favorites_${user.email}`
    : "favorites_guest";

  // ── Carrega favoritos quando o utilizador muda ────────────
  useEffect(() => {
    if (!user) {
      // Utilizador deslogado — limpa os favoritos em memória
      setFavorites([]);
      return;
    }

    const loadFavorites = async () => {
      try {
        // BACKEND: GET /api/favorites
        // Headers: Authorization: Bearer <token>
        // Response: [{ id, accommodationId, accommodation: { id, location, image, price, ... } }]
        //
        // Exemplo de como mapear a resposta do backend:
        // const res = await api.get("/favorites");
        // const list = res.data?.data ?? res.data ?? [];
        // setFavorites(list.map(f => f.accommodation ?? f));

        throw new Error("DEV"); // 🚧 DEV — remove quando o backend estiver pronto
      } catch {
        // 🚧 DEV — Fallback: localStorage por utilizador
        try {
          const saved = localStorage.getItem(storageKey);
          setFavorites(saved ? JSON.parse(saved) : []);
        } catch {
          setFavorites([]);
        }
        // 🚧 fim DEV
      }
    };

    loadFavorites();
  }, [user, storageKey]);

  // ── Persiste no localStorage (DEV) ───────────────────────
  // 🚧 DEV — Remove este useEffect quando o backend estiver pronto.
  // Com backend, a persistência é feita nas chamadas toggleFavorite/removeFavorite.
  useEffect(() => {
    if (!user) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(favorites));
    } catch {}
  }, [favorites, storageKey, user]);

  // ── Verifica se casa está nos favoritos ──────────────────
  const isFavorite = (id) => favorites.some((h) => h.id === id);

  // ── Adiciona ou remove favorito ───────────────────────────
  const toggleFavorite = async (house) => {
    const exists = isFavorite(house.id);

    // Atualização otimista — UI responde imediatamente
    setFavorites((prev) =>
      exists ? prev.filter((h) => h.id !== house.id) : [...prev, house]
    );

    try {
      if (exists) {
        // BACKEND: DELETE /api/favorites/:accommodationId
        // Headers: Authorization: Bearer <token>
        // await api.delete(`/favorites/${house.id}`);
        throw new Error("DEV"); // 🚧 DEV
      } else {
        // BACKEND: POST /api/favorites
        // Body:    { accommodationId: house.id }
        // Headers: Authorization: Bearer <token>
        // await api.post("/favorites", { accommodationId: house.id });
        throw new Error("DEV"); // 🚧 DEV
      }
    } catch {
      // 🚧 DEV — localStorage já foi atualizado pelo useEffect acima.
      // Com backend real: em caso de erro, reverter o estado otimista:
      // setFavorites((prev) =>
      //   exists ? [...prev, house] : prev.filter((h) => h.id !== house.id)
      // );
    }
  };

  // ── Remove favorito pelo ID ───────────────────────────────
  const removeFavorite = async (id) => {
    // Atualização otimista
    setFavorites((prev) => prev.filter((h) => h.id !== id));

    try {
      // BACKEND: DELETE /api/favorites/:accommodationId
      // await api.delete(`/favorites/${id}`);
      throw new Error("DEV"); // 🚧 DEV
    } catch {
      // 🚧 DEV — localStorage atualizado pelo useEffect.
    }
  };

  return (
    <FavoriteContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoriteContext);
}