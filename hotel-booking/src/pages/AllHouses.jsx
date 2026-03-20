// src/componentshouse/AllHouses.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import PraiaSection from "../componentshouse/Praiasection";
import { HouseCardSkeleton } from "../componentshouse/HouseCard";

// ─────────────────────────────────────────────────────────────
// 🚧 DEV — Lê casas adicionadas pelo admin no localStorage
// Remove esta função quando o backend estiver pronto.
const DEV_KEY = "dev_casas_admin";
const devGetCasas = () => {
  try { return JSON.parse(localStorage.getItem(DEV_KEY)) || []; }
  catch { return []; }
};
// 🚧 fim bloco DEV ────────────────────────────────────────────

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const AllHousesSkeleton = () => (
  <div className="mb-50">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    {[...Array(3)].map((_, si) => (
      <div key={si} className={`flex flex-col items-start px-4 md:px-20 pt-8 ${si === 0 ? "mt-20" : "mt-1"} relative`}>
        {si === 0 && (
          <div style={{ ...shimmerStyle, width: "300px", height: "36px", borderRadius: "8px", marginBottom: "16px" }} />
        )}
        <div style={{ ...shimmerStyle, width: "220px", height: "24px", borderRadius: "6px", marginBottom: "24px" }} />
        <div className="hidden md:grid grid-cols-5 gap-6 w-full">
          {[...Array(5)].map((_, i) => <HouseCardSkeleton key={i} />)}
        </div>
        <div className="md:hidden w-full"><HouseCardSkeleton /></div>
      </div>
    ))}
  </div>
);
// ─────────────────────────────────────────────────────────────

const AllHouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  const loadHouses = useCallback(async () => {
    try {
      // BACKEND: GET /api/accommodations
      const res = await api.get("/accommodations");
      const data = res.data?.data ?? res.data;
      setHouses(Array.isArray(data) ? data : []);
    } catch {
      // 🚧 DEV — JSON local + casas adicionadas pelo admin no localStorage
      try {
        const res = await fetch("/data/casas.json");
        const jsonCasas = await res.json();
        const devCasas = devGetCasas();
        setHouses([...jsonCasas, ...devCasas]);
      } catch (err) {
        console.error("Erro ao carregar casas:", err);
      }
      // 🚧 fim DEV
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHouses();

    // 🚧 DEV — Ouve evento disparado pelo AdminCasas quando uma casa é adicionada/editada
    // Remove este listener quando o backend estiver pronto.
    const handleDevUpdate = () => loadHouses();
    window.addEventListener("dev_casas_updated", handleDevUpdate);
    return () => window.removeEventListener("dev_casas_updated", handleDevUpdate);
    // 🚧 fim DEV
  }, [loadHouses]);

  if (loading) return <AllHousesSkeleton />;

  const praias = [...new Set(houses.map((h) => h.location).filter(Boolean))];

  return (
    <div className="mb-50">
      {praias.map((praia, index) => (
        <PraiaSection
          key={praia}
          praia={praia}
          houses={houses.filter((h) => h.location === praia)}
          title={index === 0 ? t("pontaouro.title") : undefined}
          subtitle={index === 0 ? t("pontaouro.subtitle") : undefined}
          isFirst={index === 0}
        />
      ))}
    </div>
  );
};

export default AllHouses;