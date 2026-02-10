import { createContext, useContext, useState, useEffect } from "react";

const FavoriteContext = createContext();

export function FavoriteProvider({ children }) {
  const [favorites, setFavorites] = useState([]);

  // 🔹 Carregar do localStorage
  useEffect(() => {
    const saved = localStorage.getItem("favorites");
    if (saved) setFavorites(JSON.parse(saved));
  }, []);

  // 🔹 Guardar no localStorage
  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  // 🔹 Verificar se casa está nos favoritos
  const isFavorite = (id) => favorites.some((h) => h.id === id);

  // 🔹 Alternar favorito
  const toggleFavorite = (house) => {
    setFavorites((prev) => {
      const exists = prev.some((h) => h.id === house.id);
      if (exists) {
        return prev.filter((h) => h.id !== house.id);
      }
      return [...prev, house];
    });
  };

  // 🔹 Remover favorito corretamente (pelo ID)
  const removeFavorite = (id) => {
    setFavorites((prev) => prev.filter((h) => h.id !== id));
  };

  return (
    <FavoriteContext.Provider
      value={{
        favorites,
        isFavorite,
        toggleFavorite,
        removeFavorite
      }}
    >
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoriteContext);
}
