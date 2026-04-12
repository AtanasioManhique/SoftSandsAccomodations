// src/pages/AllHouses.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import PraiaSection from "../componentshouse/Praiasection";
import { HouseCardSkeleton } from "../componentshouse/HouseCard";
import { ChevronLeft, ChevronRight, X } from "lucide-react";


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
  const [houses,      setHouses]      = useState([]);
  const [grupoGrande, setGrupoGrande] = useState(false);
  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { t }                           = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Lê todos os query params ──────────────────────────────
  const searchQuery = searchParams.get("search")    ?? "";
  const startDate   = searchParams.get("startDate") ?? "";
  const endDate     = searchParams.get("endDate")   ?? "";
  const guestsParam = Number(searchParams.get("guests") ?? 0);

  const hasFilters    = !!(searchQuery || startDate || endDate || guestsParam);
  const hasDateFilter = !!(startDate && endDate);
  const hasGuestFilter = guestsParam > 0;

  useEffect(() => { setCurrentPage(1); }, [searchQuery, startDate, endDate, guestsParam]);

  const loadHouses = useCallback(async () => {
    setLoading(true);
    try {
     
      const res  = await api.get("/accommodations", {
        params: {
          search:    searchQuery    || undefined,
          startDate: startDate     || undefined,
          endDate:   endDate       || undefined,
          guests:    guestsParam   || undefined,

          limit: 100,
        },
      });
      const data = res.data?.data ?? res.data;
      setHouses(Array.isArray(data) ? data : []);
      setGrupoGrande(res.data?.grupoGrande ?? false);
    } catch (err) {
      console.error("Erro ao carregar casas:", err);
      setHouses([]);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, startDate, endDate, guestsParam]);

  useEffect(() => {
    loadHouses();
  }, [loadHouses]);

  if (loading) return <AllHousesSkeleton />;

  // Praias únicas por ordem de aparecimento
  const todasPraias = [...new Set(houses.map((h) => h.location).filter(Boolean))];

  // ── Paginação ─────────────────────────────────────────────
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

  const clearSearch = () => { setSearchParams({}); setCurrentPage(1); };
  // ─────────────────────────────────────────────────────────

  return (
    <div className="mb-10">

      {/* ── Banner de filtros ativos ────────────────────────── */}
      {hasFilters && (
        <div className="px-4 md:px-20 pt-24 pb-2 space-y-2">

          <div className="flex flex-wrap items-center gap-2">
            {searchQuery && (
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                📍 {searchQuery}
              </span>
            )}
            {hasDateFilter && (
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                📅 {startDate} → {endDate}
              </span>
            )}
            {hasGuestFilter && (
              <span className="bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1 rounded-full">
                👥 {guestsParam} {"all.guest"}{guestsParam !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={clearSearch}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition ml-1"
            >
              <X size={12} /> {t("all.clean")}
            </button>
          </div>

          {/* Contagem de resultados */}
          {houses.length > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{houses.length}</span>{" "}
              casa{houses.length !== 1 ? "s" : ""} {t("all.in")}{" "}
              <span className="font-semibold text-gray-900">{todasPraias.length}</span>{" "}
              praia{todasPraias.length !== 1 ? "s" : ""}
              {hasDateFilter && (
                <span className="text-gray-400"> · {t("all.available")}</span>
              )}
            </p>
          )}

          {/* Aviso grupo grande — devolvido pelo backend */}
          {grupoGrande && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 max-w-xl">
              <span className="text-base leading-none mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  {t("all.support")}{guestsParam} {t("all.casas")}
                </p>
                <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                 {t("all.destiny")}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sem resultados ─────────────────────────────────── */}
      {hasFilters && todasPraias.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="text-5xl mb-4">🏖️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t("all.found")}
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
           {t("all.criterio")}
          </p>
          <button
            onClick={clearSearch}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-black transition"
          >
            {t("all.see")}
          </button>
        </div>
      )}

      {/* ── Praias ─────────────────────────────────────────── */}
      {praiasPagina.map((praia, index) => (
        <PraiaSection
          key={praia}
          praia={praia}
          houses={houses.filter((h) => h.location === praia)}
          isFirst={index === 0 && currentPage === 1 && !hasFilters}
        />
      ))}

      {/* ── Paginação ──────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 py-10 px-4">
          <p className="text-sm text-gray-500">
            {t("all.beach")}{" "}
            <span className="font-semibold text-gray-700">
              {startIndex + 1}–{Math.min(startIndex + PRAIAS_PER_PAGE, todasPraias.length)}
            </span>{" "}
            de{" "}
            <span className="font-semibold text-gray-700">{todasPraias.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-gray-800 hover:text-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm">
              <ChevronLeft size={16} />
            </button>
            {getPageNumbers().map((page) => (
              <button key={page} onClick={() => goToPage(page)}
                className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-semibold transition border shadow-sm ${
                  page === currentPage ? "bg-gray-800 text-white border-gray-800" : "bg-white text-gray-600 border-gray-200 hover:border-gray-800 hover:text-gray-800"
                }`}>
                {page}
              </button>
            ))}
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:border-gray-800 hover:text-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white shadow-sm">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllHouses;