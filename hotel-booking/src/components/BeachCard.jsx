// src/components/BeachCard.jsx
import { Link } from "react-router-dom";
import fullstar from "../assets/fullstar.png";
import locationicon from "../assets/location.png";
import FavoriteButton from "../componentshouse/FavoriteButton";
import { useTranslation } from "react-i18next";
import { formatCurrency, convertPrice } from "../context/utils/currency";
import { useCurrency } from "../FormDropDown/CurrencyContext";

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

export const BeachCardSkeleton = () => (
  <>
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #f0f0f0", background: "#fff" }}>
      <div style={{ ...shimmerStyle, width: "100%", height: "192px" }} />
      <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <div style={{ ...shimmerStyle, width: "16px", height: "16px", borderRadius: "50%", flexShrink: 0 }} />
          <div style={{ ...shimmerStyle, width: "110px", height: "14px", borderRadius: "4px" }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...shimmerStyle, width: "90px", height: "14px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "36px", height: "14px", borderRadius: "4px" }} />
        </div>
      </div>
      <div style={{ ...shimmerStyle, margin: "0 12px 12px", height: "36px", borderRadius: "8px" }} />
    </div>
  </>
);
// ─────────────────────────────────────────────────────────────

// Resolve a imagem independentemente do formato que o backend devolve
const resolveImage = (house) => {

  if (house.primaryImageUrl) return house.primaryImageUrl;
  // Formato: images: [{ url: "..." }, ...]
  if (Array.isArray(house.images) && house.images.length > 0) {
    const first = house.images[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
    if (first?.image_url) return first.image_url;
    if (first?.src) return first.src;
  }
  // Formato: image: ["url", ...]
  if (Array.isArray(house.image) && house.image.length > 0) {
    const first = house.image[0];
    if (typeof first === "string") return first;
    if (first?.url) return first.url;
  }
  // Formato: image_url: "..."
  if (house.image_url) return house.image_url;
  // Formato: thumbnail: "..."
  if (house.thumbnail) return house.thumbnail;

  return null;
};

const BeachCard = ({ house }) => {
  const { t } = useTranslation();
  const { currency, rates } = useCurrency();

  const imageUrl = resolveImage(house);

  // Preço: backend guarda tudo em ZAR
  const priceZAR = house.price_per_night ?? house.pricePerNight ?? 0;
  const converted = convertPrice(priceZAR, "ZAR", currency, rates);

  return (
    <div className="relative block bg-white rounded-2xl overflow-hidden border border-gray-100 transition hover:scale-[1.02] sm:mx-0">

      <FavoriteButton house={house} />

      <Link to={`/casas/${house.id}`} onClick={() => scrollTo(0, 0)}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={house.name ?? house.location ?? "Casa"}
            className="w-full h-40 sm:h-44 md:h-48 object-cover"
          />
        ) : (
          <div className="w-full h-40 sm:h-44 md:h-48 bg-gray-100 flex items-center justify-center text-4xl">🏠</div>
        )}

        <div className="p-2 flex flex-col gap-1.5">
          <p className="text-sm font-semibold text-gray-900 truncate">{house.name}</p>
          <div className="flex items-center text-sm text-gray-600 gap-1">
            <img src={locationicon} alt="localização" className="w-4 h-4" />
            <span className="truncate">{house.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(converted, currency)} / {t("favorites.night")}
            </span>
                        <div className="flex items-center text-sm text-gray-700 gap-1">
                          <img src={fullstar} alt="rating" className="w-4 h-4" />
                          <span>{house.rating}</span>
                        </div>
          </div>
        </div>
      </Link>

      <Link to={`/casas/${house.id}#reserveid`}>
        <button className="mx-3 mb-3 mt-1 w-[calc(100%-1.5rem)] bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-sm">
          {t("reservebutton")}
        </button>
      </Link>
    </div>
  );
};

export default BeachCard;