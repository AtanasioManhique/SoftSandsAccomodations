import React, { useState, useEffect } from "react";
import { useFavorites } from "../componentshouse/FavoriteStore";
import { Link } from "react-router-dom";
import { HeartOff, ChevronLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSeasonPricing } from "../context/seasonPricing.js";

// ── Skeleton da FavoritesPage ─────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const FavoritesPageSkeleton = () => (
  <div className="px-4 md:px-20 py-10">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

    {/* Botão voltar skeleton */}
    <div style={{ ...shimmerStyle, width: "100px", height: "20px", borderRadius: "6px", marginBottom: "24px" }} />

    {/* Título skeleton */}
    <div style={{ ...shimmerStyle, width: "220px", height: "32px", borderRadius: "8px", marginBottom: "24px", marginTop: "60px" }} />

    {/* Grid de cards skeleton */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ borderRadius: "12px", overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <div style={{ ...shimmerStyle, width: "100%", height: "192px" }} />
          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ ...shimmerStyle, width: "120px", height: "14px", borderRadius: "4px" }} />
            <div style={{ ...shimmerStyle, width: "90px", height: "16px", borderRadius: "4px" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────


const resolveImage = (house) =>
  house.primaryImageUrl ??
  house.imageUrl ??
  house.images?.[0]?.url ??
  house.images?.[0]?.image_url ??
  house.image?.[0] ??
  null;

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useFavorites();
  const { t } = useTranslation();
  const { getNightPrice } = useSeasonPricing();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <FavoritesPageSkeleton />;

  const hasFavorites = favorites.length > 0;

  return (
    <div className="px-4 md:px-20 py-10">

      {/* Voltar */}
      <Link to="/" className="flex items-center gap-2 text-gray-700 mb-6 hover:underline">
        <ChevronLeft size={20} />
        {t("favorites.back")}
      </Link>

      {/* Título */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-5 mt-15">
        {t("favorites.title")}
      </h1>

      {/* Com favoritos */}
      {hasFavorites && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((house) => {
            const { formatted } = getNightPrice(house.price);
            const imageUrl = resolveImage(house);

            return (
              <div
                key={house.id}
                className="relative bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <button
                  onClick={() => removeFavorite(house.id)}
                  className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow hover:bg-red-50 hover:scale-110 transition z-10"
                >
                  <HeartOff className="text-red-500 w-5 h-5" />
                </button>

                <Link to={`/casas/${house.id}`}>
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={house.name ?? house.location ?? "Casa"}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    // ✅ Fallback visual quando não há imagem
                    <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
                      </svg>
                      <span className="text-xs text-gray-300">Sem imagem</span>
                    </div>
                  )}
                  <div className="p-4">
                    <p className="text-sm text-gray-500">{house.location}</p>
                    <p className="text-base font-semibold mt-1">
                      {formatted} / {t("favorites.night")}
                    </p>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* Sem favoritos */}
      {!hasFavorites && (
        <div className="flex flex-col items-center justify-center text-center mt-10">
          <div className="bg-gray-100 rounded-2xl p-10 w-60 h-52 flex items-center justify-center">
            <img src="/icons/beach.png" alt="Hotel icon" className="w-28 h-28 opacity-70" />
          </div>
          <h2 className="text-xl font-semibold mt-6">{t("favorites.click")}</h2>
          <Link
            to="/praias"
            className="mt-6 bg-gray-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-black transition"
          >
            {t("favorites.explore")}
          </Link>
        </div>
      )}
    </div>
  );
}