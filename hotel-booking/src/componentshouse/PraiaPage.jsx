import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HouseCard, { HouseCardSkeleton } from "../componentshouse/HouseCard";
import { useTranslation } from "react-i18next";

// ── Skeleton da PraiaPage ─────────────────────────────────────
const PraiaPageSkeleton = () => {
  const shimmerStyle = {
    background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.4s infinite",
  };

  return (
    <div className="p-6 mt-20">
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Título skeleton */}
      <div style={{ ...shimmerStyle, width: "280px", height: "32px", borderRadius: "8px", marginBottom: "24px" }} />

      {/* Grid de cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <HouseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
// ─────────────────────────────────────────────────────────────

export default function PraiaPage() {
  const { praia } = useParams();
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (house) => house.location.toLowerCase() === praia.toLowerCase()
        );
        setHouses(filtered);
      })
      .catch((err) => console.error("Erro ao carregar casas:", err))
      .finally(() => setLoading(false));
  }, [praia]);

  if (loading) return <PraiaPageSkeleton />;

  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">
        {t("beachpage.homes")} {praia}
      </h1>

      {houses.length === 0 && (
        <p className="text-gray-600 text-lg">{t("beachpage.found")}</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {houses.map((house) => (
          <HouseCard key={house.id} house={house} />
        ))}
      </div>
    </div>
  );
}