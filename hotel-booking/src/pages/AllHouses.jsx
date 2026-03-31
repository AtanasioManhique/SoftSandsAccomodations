// src/pages/AllHouses.jsx
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import PraiaSection from "../componentshouse/Praiasection";
import { HouseCardSkeleton } from "../componentshouse/HouseCard";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// 🚧 DEV — Lê casas adicionadas pelo admin no localStorage
const DEV_KEY = "dev_casas_admin";
const devGetCasas = () => {
  try { return JSON.parse(localStorage.getItem(DEV_KEY)) || []; }
  catch { return []; }
};
// 🚧 fim bloco DEV ────────────────────────────────────────────

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
  const [loading,     setLoading]     = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const { t }                           = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Lê todos os query params ──────────────────────────────
  // Podem vir do Center (pesquisa completa) ou do Navbar SearchOverlay (só search)
  const searchQuery = searchParams.get("search")    ?? "";
  const startDate   = searchParams.get("startDate") ?? "";
  const endDate     = searchParams.get("endDate")   ?? "";
  const guestsParam = Number(searchParams.get("guests") ?? 0);

  const hasFilters  = !!(searchQuery || startDate || endDate || guestsParam);
  const hasDateFilter   = !!(startDate && endDate);
  const hasGuestFilter  = guestsParam > 0;

  // Volta à página 1 sempre que os filtros mudam
  useEffect(() => { setCurrentPage(1); }, [searchQuery, startDate, endDate, guestsParam]);

  const loadHouses = useCallback(async () => {
    setLoading(true);
    try {
      // ── BACKEND: GET /api/accommodations ─────────────────
      // Quando o backend estiver pronto, passa todos os filtros
      // para o servidor — ele filtra disponibilidade e capacidade:
      //
      //   GET /api/accommodations?search=Bilene&startDate=2025-09-01&endDate=2025-09-05&guests=4
      //
      // O backend deve:
      //   1. Filtrar por location/description/amenities (search)
      //   2. Excluir casas com reservas no período (startDate/endDate)
      //   3. Filtrar por capacity >= guests
      //
      // Para ativar: substitui api.get("/accommodations") por:
      //   const res = await api.get("/accommodations", {
      //     params: { search: searchQuery, startDate, endDate, guests: guestsParam || undefined }
      //   });
      // E remove todos os blocos de filtragem frontend abaixo.
      const res  = await api.get("/accommodations");
      const data = res.data?.data ?? res.data;
      setHouses(Array.isArray(data) ? data : []);
    } catch {
      // 🚧 DEV — JSON local + casas adicionadas pelo admin no localStorage
      try {
        const res       = await fetch("/data/casas.json");
        const jsonCasas = await res.json();
        const devCasas  = devGetCasas();
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
    // 🚧 DEV — Ouve evento disparado pelo AdminCasas
    const handleDevUpdate = () => { setCurrentPage(1); loadHouses(); };
    window.addEventListener("dev_casas_updated", handleDevUpdate);
    return () => window.removeEventListener("dev_casas_updated", handleDevUpdate);
    // 🚧 fim DEV
  }, [loadHouses]);

  if (loading) return <AllHousesSkeleton />;

  // ── Filtragem frontend (DEV) ──────────────────────────────
  // Com backend: apaga este bloco inteiro — os dados já vêm filtrados.
  let casasFiltradas = houses;

  // 1. Filtro por texto (location, description, amenities)
  if (searchQuery.trim()) {
    const lower = searchQuery.toLowerCase();
    casasFiltradas = casasFiltradas.filter((h) =>
      h.location?.toLowerCase().includes(lower) ||
      h.description?.toLowerCase().includes(lower) ||
      h.amenities?.some((a) => a.name?.toLowerCase().includes(lower))
    );
  }

  // 2. Filtro por hóspedes — mostra casas com capacity >= guests
  //    Se nenhuma casa suporta o nº pedido, mostra TODAS as casas do destino
  //    com aviso (grupo grande — precisam de reservar mais do que uma).
  //    Não bloqueamos a pesquisa para não deixar o utilizador sem resultados.
  let grupoGrande = false;
  if (hasGuestFilter) {
    const casasComCapacidade = casasFiltradas.filter((h) => (h.capacity ?? 0) >= guestsParam);
    if (casasComCapacidade.length === 0) {
      // Nenhuma casa suporta este nº sozinha — mostra todas e avisa
      grupoGrande = true;
    } else {
      casasFiltradas = casasComCapacidade;
    }
  }

  // 3. Filtro por datas — DEV: não temos reservas reais,
  //    por isso só passamos os params ao backend quando estiver pronto.
  //    Aqui apenas guardamos as datas para mostrar no banner.
  // ─────────────────────────────────────────────────────────

  // Praias únicas por ordem de aparecimento
  const todasPraias = [...new Set(casasFiltradas.map((h) => h.location).filter(Boolean))];

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

      {/* ── Banner de filtros ativos ──────────────────────────
          Mostra um resumo dos filtros aplicados e botão para limpar.
          Aparece quando vem do Center ou do Navbar SearchOverlay.
      ───────────────────────────────────────────────────────── */}
      {hasFilters && (
        <div className="px-4 md:px-20 pt-24 pb-2 space-y-2">

          {/* Resumo dos filtros */}
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
                👥 {guestsParam} hóspede{guestsParam !== 1 ? "s" : ""}
              </span>
            )}
            <button
              onClick={clearSearch}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition ml-1"
            >
              <X size={12} /> Limpar filtros
            </button>
          </div>

          {/* Contagem de resultados */}
          {casasFiltradas.length > 0 && (
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{casasFiltradas.length}</span>{" "}
              casa{casasFiltradas.length !== 1 ? "s" : ""} em{" "}
              <span className="font-semibold text-gray-900">{todasPraias.length}</span>{" "}
              praia{todasPraias.length !== 1 ? "s" : ""}
              {hasDateFilter && (
                <span className="text-gray-400"> · disponíveis no período selecionado</span>
              )}
            </p>
          )}

          {/* Aviso grupo grande */}
          {grupoGrande && (
            <div className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 max-w-xl">
              <span className="text-base leading-none mt-0.5">⚠️</span>
              <div>
                <p className="text-sm font-semibold text-orange-800">
                  Nenhuma casa suporta {guestsParam} hóspedes sozinha
                </p>
                <p className="text-xs text-orange-700 mt-0.5 leading-relaxed">
                  Estamos a mostrar todas as casas disponíveis. Para grupos grandes, podes reservar mais do que uma casa no mesmo destino.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Sem resultados ────────────────────────────────────── */}
      {hasFilters && todasPraias.length === 0 && (
        <div className="flex flex-col items-center justify-center text-center py-20 px-4">
          <div className="text-5xl mb-4">🏖️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Nenhuma casa encontrada
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-sm">
            Não encontrámos casas com esses critérios. Tenta ajustar as datas, o número de hóspedes ou o destino.
          </p>
          <button
            onClick={clearSearch}
            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-black transition"
          >
            Ver todas as praias
          </button>
        </div>
      )}

      {/* ── Praias ─────────────────────────────────────────────── */}
      {praiasPagina.map((praia, index) => (
        <PraiaSection
          key={praia}
          praia={praia}
          houses={casasFiltradas.filter((h) => h.location === praia)}
          isFirst={index === 0 && currentPage === 1 && !hasFilters}
        />
      ))}

      {/* ── Paginação ─────────────────────────────────────────── */}
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