// src/componentshouse/AllHouses.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import PraiaSection from "../componentshouse/Praiasection";
import { HouseCardSkeleton } from "../componentshouse/HouseCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────
/* // 🚧 DEV — Lê casas adicionadas pelo admin no localStorage
const DEV_KEY = "dev_casas_admin";
const devGetCasas = () => {
  try { return JSON.parse(localStorage.getItem(DEV_KEY)) || []; }
  catch { return []; }
};
// 🚧 fim bloco DEV ──────────────────────────────────────────── */

const PRAIAS_PER_PAGE = 4;

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
  const [houses, setHouses]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();

  const loadHouses = useCallback(async () => {
    try {
      // BACKEND: GET /api/accommodations
      const res  = await api.get("/accommodations");
      const data = res.data?.data ?? res.data;
      setHouses(Array.isArray(data) ? data : []);
    } catch {
      /*// 🚧 DEV — JSON local + casas adicionadas pelo admin no localStorage
      try {
        const res      = await fetch("/data/casas.json");
        const jsonCasas = await res.json();
        const devCasas = devGetCasas();
        setHouses([...jsonCasas, ...devCasas]);
      } catch (err) {
        console.error("Erro ao carregar casas:", err);
      }
      // 🚧 fim DEV // fallback */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHouses();

   /* // 🚧 DEV — Ouve evento disparado pelo AdminCasas quando uma casa é adicionada/editada
    const handleDevUpdate = () => { setCurrentPage(1); loadHouses(); };
    window.addEventListener("dev_casas_updated", handleDevUpdate);
    return () => window.removeEventListener("dev_casas_updated", handleDevUpdate);
    // 🚧 fim DEV */
  }, [loadHouses]);

  if (loading) return <AllHousesSkeleton />;

  // Praias únicas por ordem de aparecimento
  const todasPraias = [...new Set(houses.map((h) => h.location).filter(Boolean))];

  // ── Paginação por praias ──────────────────────────────────
  const totalPages   = Math.ceil(todasPraias.length / PRAIAS_PER_PAGE);
  const startIndex   = (currentPage - 1) * PRAIAS_PER_PAGE;
  const praiasPagina = todasPraias.slice(startIndex, startIndex + PRAIAS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };
  // ─────────────────────────────────────────────────────────

  return (
    <div className="mb-5">
    
      {praiasPagina.map((praia, index) => (
        <PraiaSection
          key={praia}
          praia={praia}
          houses={houses.filter((h) => h.location === praia)}
          isFirst={index === 0 && currentPage === 1}
        />
      ))}

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 py-10 px-4">
          <p className="text-sm text-gray-500">
            Praias{" "}
            <span className="font-semibold text-gray-700">
              {startIndex + 1}–{Math.min(startIndex + PRAIAS_PER_PAGE, todasPraias.length)}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-700">{todasPraias.length}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-gray-800 hover:text-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
            >
              <ChevronLeft size={16} />
            </button>

            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition border shadow-sm ${
                  page === currentPage
                    ? "bg-gray-800 text-white border-gray-800"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-800 hover:text-gray-800"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-gray-800 hover:text-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllHouses;