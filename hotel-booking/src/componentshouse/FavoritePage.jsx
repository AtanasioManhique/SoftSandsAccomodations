import React from "react";
import { useFavorites } from "../componentshouse/FavoriteStore";
import { Link } from "react-router-dom";
import { HeartOff, ChevronLeft } from "lucide-react";
import {useTranslation} from "react-i18next"

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const {t} = useTranslation();
    const hasFavorites = favorites.length > 0;

  return (
    <div className="px-4 md:px-20 py-10">

      {/* 🔙 Voltar */}
      <Link to="/" className="flex items-center gap-2 text-gray-700 mb-6 hover:underline">
        <ChevronLeft size={20} />
        {t("favorites.back")}
      </Link>

      {/* 🏷️ Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 mt-15">
        {t("favorites.title")}
      </h1>

      {/* 🧡 Se tiver favoritos */}
      {hasFavorites && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((house) => (
            <div
              key={house.id}
              className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
            >
              {/* ❌ Remover dos favoritos */}
              <button
                onClick={() => removeFavorite(house.id)}
                className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow hover:bg-red-50 hover:scale-110 transition z-10"
              >
                <HeartOff className="text-red-500 w-5 h-5" />
              </button>

              {/* 📸 Imagem */}
              <Link to={`/casas/${house.id}`}>
                <img
                  src={house.image[0]}
                  alt={house.name}
                  className="w-full h-48 object-cover"
                />

                <div className="p-4">
                  <p className="text-sm text-gray-500">{house.location}</p>
                  <p className="text-base font-semibold mt-1">
                    {house.price.low_season} {house.price.currency} / {t("favorites.night")}
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* 🕳️ Se NÃO tiver favoritos */}
      {!hasFavorites && (
        <div className="flex flex-col items-center justify-center text-center mt-10">

          {/* Ilustração estilo Booking */}
          <div className="bg-gray-100 rounded-2xl p-10 w-60 h-52 flex items-center justify-center">
            <img
              src="/icons/beach.png"
              alt="Hotel icon"
              className="w-28 h-28 opacity-70"
            />
          </div>

          <h2 className="text-xl font-semibold mt-6">{t("favorites.click")}</h2>

          <Link
            to="/praias"
            className="
              mt-6 bg-gray-900 text-white 
              px-6 py-3 rounded-lg font-medium 
              hover:bg-black transition
            "
          >
           {t("favorites.explore")}
          </Link>
          
        </div>
      )}
    </div>
  );
}
