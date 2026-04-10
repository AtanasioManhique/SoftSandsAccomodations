// src/componentshouse/HouseCard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import fullstar from "../assets/fullstar.png";
import locationicon from "../assets/location.png";
import FavoriteButton from "./FavoriteButton";
import { useTranslation } from "react-i18next";
import { useSeasonPricing } from "../context/seasonPricing.js";

// ── Skeleton do HouseCard ─────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

export const HouseCardSkeleton = () => (
  <>
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{
      borderRadius: "12px",
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    }}>
      <div style={{ ...shimmerStyle, width: "100%", height: "192px" }} />
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <div style={{ ...shimmerStyle, width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ ...shimmerStyle, width: "110px", height: "14px", borderRadius: "4px" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...shimmerStyle, width: "100px", height: "14px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "36px", height: "14px", borderRadius: "4px" }} />
        </div>
        <div style={{ ...shimmerStyle, width: "100%", height: "36px", borderRadius: "8px" }} />
      </div>
    </div>
  </>
);
// ─────────────────────────────────────────────────────────────

// ── Helper: extrai a URL da imagem principal seja qual for a estrutura ──
// Backend devolve:  house.images = [{ url, is_primary, ... }]
// Fallback antigo:  house.image  = ["url1", "url2"]
const getMainImage = (house) =>
  house.images?.find((img) => img.is_primary)?.url  // imagem marcada como principal
  ?? house.images?.[0]?.url                          // primeira do array de objectos
  ?? house.image?.[0]                                // fallback para array de strings
  ?? null;

const HouseCard = ({ house }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getNightPrice } = useSeasonPricing();
  const { formatted } = getNightPrice(house.price);

  const mainImage = getMainImage(house);

  const handleReserveClick = (e) => {
    e.preventDefault();
    const target = `/casas/${house.id}#reserveid`;
    navigate(target);
    setTimeout(() => {
      const el = document.getElementById("reserveid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 160);
  };

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition block">
      <FavoriteButton house={house} />

      <Link to={`/casas/${house.id}`}>
        {mainImage ? (
          <img
            src={mainImage}
            alt={house.location ?? "Casa"}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
            </svg>
            <span className="text-xs text-gray-300">Sem imagem</span>
          </div>
        )}
      </Link>

      <div className="p-4">
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <img src={locationicon} alt="localização" className="w-4 h-4" />
          <span>{house.location}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-semibold text-gray-900">
            {formatted} / {t("favorites.night")}
          </span>
          <div className="flex items-center text-sm text-gray-700 gap-1">
            <img src={fullstar} alt="rating" className="w-4 h-4" />
            <span>{house.rating}</span>
          </div>
        </div>

        <button
          onClick={handleReserveClick}
          className="mt-3 w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-medium"
        >
          {t("reservebutton")}
        </button>
      </div>
    </div>
  );
};

export default HouseCard;