import { Heart } from "lucide-react";
import { useFavorites } from "./FavoriteStore";
import { useAuth } from "../context/AuthContext";
import { useLoginModal } from "../context/LoginModalContext";

export default function FavoriteButton({ house }) {
  const { isFavorite, toggleFavorite } = useFavorites();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();

  const active = isFavorite(house.id);

  const handleClick = (e) => {
    e.preventDefault();      // evita navegação do <Link>
    e.stopPropagation();     // evita clique borbulhar para Card ou Link

    // ✅ NOVO: verificar login
    if (!user) {
      openLogin();
      return;
    }

    toggleFavorite(house);
  };

  return (
    <button
      onClick={handleClick}
      className="
        absolute top-3 right-3 
        bg-white/90 backdrop-blur-md 
        rounded-full p-2 shadow-md 
        hover:scale-110 active:scale-95 
        transition z-20
      "
    >
      <Heart
        className={`w-6 h-6 transition ${
          active ? "fill-red-500 text-red-500" : "text-gray-700"
        }`}
      />
    </button>
  );
}
