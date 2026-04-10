// components/Center.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { api } from "../services/api";

// ── Fix timezone ──────────────────────────────────────────────
const formatLocalDate = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};
// ─────────────────────────────────────────────────────────────

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmerWhite 1.4s infinite",
};

const CenterSkeleton = () => (
  <div className="relative isolate flex flex-col items-start justify-center
    px-4 md:px-14 lg:[padding-left:5.5rem] xl:[padding-left:7.5rem]
    min-h-[90vh] bg-[url('/src/assets/backgroundimage.png')]
    bg-no-repeat bg-cover bg-center text-white pt-10 md:pt-0 -mb-9"
  >
    <style>{`@keyframes shimmerWhite { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{ ...shimmerStyle, width: "340px", height: "48px", borderRadius: "8px", marginBottom: "12px" }} />
    <div style={{ ...shimmerStyle, width: "240px", height: "48px", borderRadius: "8px", marginBottom: "16px" }} />
    <div style={{ ...shimmerStyle, width: "420px", height: "18px", borderRadius: "6px", marginBottom: "6px" }} />
    <div style={{ ...shimmerStyle, width: "300px", height: "18px", borderRadius: "6px", marginBottom: "24px" }} />
    <div className="hidden md:flex bg-white/20 backdrop-blur rounded-lg px-3 py-3 gap-3 w-full max-w-[900px]">
      {[180, 160, 160, 100].map((w, i) => (
        <div key={i} style={{ width: `${w}px` }}>
          <div style={{ ...shimmerStyle, width: "80px", height: "14px", borderRadius: "4px", marginBottom: "6px" }} />
          <div style={{ ...shimmerStyle, width: "100%", height: "34px", borderRadius: "6px" }} />
        </div>
      ))}
      <div style={{ ...shimmerStyle, width: "80px", height: "42px", borderRadius: "6px", alignSelf: "flex-end" }} />
    </div>
    <div className="md:hidden bg-white/20 backdrop-blur rounded-lg px-4 py-4 w-full max-w-[360px]">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ ...shimmerStyle, width: "60px", height: "14px", borderRadius: "4px", marginBottom: "6px" }} />
          <div style={{ ...shimmerStyle, width: "100%", height: "36px", borderRadius: "6px" }} />
        </div>
        {[1, 2].map((i) => (
          <div key={i}>
            <div style={{ ...shimmerStyle, width: "80px", height: "14px", borderRadius: "4px", marginBottom: "6px" }} />
            <div style={{ ...shimmerStyle, width: "100%", height: "36px", borderRadius: "6px" }} />
          </div>
        ))}
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ ...shimmerStyle, width: "70px", height: "14px", borderRadius: "4px", marginBottom: "6px" }} />
          <div style={{ ...shimmerStyle, width: "100%", height: "36px", borderRadius: "6px" }} />
        </div>
      </div>
      <div style={{ ...shimmerStyle, width: "100%", height: "40px", borderRadius: "6px", marginTop: "16px" }} />
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────

const Center = () => {
  const [destinos,         setDestinos]         = useState([]);
  const [selectedDestino,  setSelectedDestino]  = useState("");
  const [startDate,        setStartDate]        = useState(null);
  const [endDate,          setEndDate]          = useState(null);
  const [guests,           setGuests]           = useState("");
  const [loading,          setLoading]          = useState(true);
  const [activeField,      setActiveField]      = useState(null);
  const [guestWarning,     setGuestWarning]     = useState(false);
  const [maxCapacity,      setMaxCapacity]      = useState(16);

  const { t }         = useTranslation();
  const navigate      = useNavigate();
  const datepickerRef = useRef(null);

  useEffect(() => {
    loadDestinos();
    loadMaxCapacity();
  }, []);

  const loadMaxCapacity = async () => {
    try {
      // GET /api/accommodations/max-capacity
      // Resposta esperada: { maxCapacity: 16 }
      const res = await api.get("/accommodations", { params: { limit: 100}});
      const data = res.data?.data ?? [];
      const max = Math.max(...data.map((h) => h.max_guests ?? h.maxGuests ?? 0), 1);
      setMaxCapacity(max);
      setMaxCapacity(res.data.maxCapacity);
    } catch(err) {
      // fallback — valor por omissão
      console.error("Erro ao carregar capacidade máxima:", err.response?.data ?? err.message ?? err);
      setMaxCapacity(10);
    }
  };

  const loadDestinos = async () => {
    try {
      // GET /api/accommodations/destinations
      // Resposta esperada: [{ id: 1, nome: "Ponta de Ouro" }, ...]
      const res  = await api.get("/accommodations");
      const data = res.data?.data ?? res.data ?? [];
      setDestinos(Array.isArray(data) ? data : []);
    } catch {
      // fallback — extrai destinos a partir de /accommodations
      try {
        const res   = await api.get("/accommodations");
        const data  = res.data?.data ?? res.data ?? [];
        const casas = Array.isArray(data) ? data : [];
        const map   = {};
        casas.forEach((c, i) => {
          if (!c.location || map[c.location]) return;
          map[c.location] = { id: i + 1, nome: c.location };
        });
        setDestinos(Object.values(map));
      } catch {
        setDestinos([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <CenterSkeleton />;

  const openCalendar = (field) => {
    setActiveField(field);
    setTimeout(() => datepickerRef.current?.setOpen(true), 0);
  };

  const handleDateChange = (date) => {
    if (activeField === "start") {
      setStartDate(date);
      if (endDate && date > endDate) setEndDate(null);
      setActiveField("end");
    } else {
      if (!startDate || date >= startDate) {
        setEndDate(date);
        datepickerRef.current?.setOpen(false);
      }
    }
  };

  const handleGuestsChange = (e) => {
    const val = Number(e.target.value);
    setGuests(e.target.value);
    setGuestWarning(val > maxCapacity);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedDestino || !startDate || !endDate || !guests) return;

  
    navigate(
      `/pesquisa?search=${encodeURIComponent(selectedDestino)}&startDate=${formatLocalDate(startDate)}&endDate=${formatLocalDate(endDate)}&guests=${guests}`
    );
  };

  // ── Campos partilhados ────────────────────────────────────
  const destinoField = (
    <select
      className="rounded border border-gray-200 px-3 py-1.5 text-sm outline-none w-full"
      value={selectedDestino}
      onChange={(e) => setSelectedDestino(e.target.value)}
      required
    >
      <option value="">{t("center.destinyselector")}</option>
      {destinos.map((d) => (
        <option key={d.id} value={d.nome}>{d.nome}</option>
      ))}
    </select>
  );

  const entradaField = (
    <div
      onClick={() => openCalendar("start")}
      className="flex items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-sm cursor-pointer"
    >
      <span>{startDate ? startDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
      <Calendar size={16} />
    </div>
  );

  const saidaField = (
    <div
      onClick={() => openCalendar("end")}
      className="flex items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-sm cursor-pointer"
    >
      <span>{endDate ? endDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
      <Calendar size={16} />
    </div>
  );

  const hospedField = (
    <input
      type="number"
      min={1}
      value={guests}
      onChange={handleGuestsChange}
      className={`rounded border px-3 py-1.5 text-sm w-full outline-none transition-colors ${
        guestWarning
          ? "border-orange-300 bg-orange-50 text-orange-800"
          : "border-gray-200"
      }`}
      placeholder="0"
      required
    />
  );

  return (
    <div className="relative isolate flex flex-col items-start justify-center
      px-4 md:px-14 lg:[padding-left:5.5rem] xl:[padding-left:7.5rem]
      min-h-[90vh] text-white pt-10 md:pt-0 -mb-9"
    >
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/src/assets/backgroundimage.png')" }}
      />

      <h1 className="font-playfair text-3xl md:text-5xl font-bold max-w-xl mt-4">
        {t("center.title")}
      </h1>
      <p className="max-w-[32.5rem] mt-2 text-sm md:text-base">
        {t("center.subtitle")}
      </p>

      {guestWarning && (
        <div className="mt-3 flex items-start gap-2 bg-orange-500/20 backdrop-blur border border-orange-300/40 rounded-xl px-4 py-3 max-w-[500px] w-full">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <p className="text-white text-sm font-semibold leading-snug">
              Grupo grande detectado
            </p>
            <p className="text-white/80 text-xs mt-0.5 leading-relaxed">
              Nenhuma casa suporta {guests} hóspedes sozinha. Mostraremos todas as casas disponíveis. Podes reservar mais do que uma para o teu grupo.
            </p>
          </div>
        </div>
      )}

      {/* ==================== DESKTOP ==================== */}
      <form
        onSubmit={handleSubmit}
        className="hidden md:flex bg-white text-gray-700 rounded-lg px-3 py-3
        flex-row items-center gap-3 mt-4 w-full max-w-[900px]"
      >
        <div className="flex flex-col w-[180px]">
          <label className="text-sm font-medium mb-1">{t("center.destiny")}</label>
          {destinoField}
        </div>
        <div className="flex flex-col w-[160px]">
          <label className="text-sm font-medium mb-1">{t("center.entrydate")}</label>
          {entradaField}
        </div>
        <div className="flex flex-col w-[160px]">
          <label className="text-sm font-medium mb-1">{t("center.outdate")}</label>
          {saidaField}
        </div>
        <div className="flex flex-col w-[100px]">
          <label className="text-sm font-medium mb-1">{t("center.guests")}</label>
          {hospedField}
        </div>
        <button
          type="submit"
          className="rounded-md bg-black py-2 px-5 text-white h-[42px] text-sm whitespace-nowrap self-end"
        >
          {t("center.search")}
        </button>
      </form>

      {/* ==================== MOBILE ==================== */}
      <form
        onSubmit={handleSubmit}
        className="md:hidden bg-white text-gray-700 rounded-lg px-4 py-4
        mt-4 w-full max-w-[360px]"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">{t("center.destiny")}</label>
            {destinoField}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">{t("center.entrydate")}</label>
            {entradaField}
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">{t("center.outdate")}</label>
            {saidaField}
          </div>
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">{t("center.guests")}</label>
            {hospedField}
          </div>
        </div>
        <button
          type="submit"
          className="bg-black text-white rounded py-2 mt-4 w-full text-sm"
        >
          {t("center.search")}
        </button>
      </form>

      {/* ==================== DATEPICKER ==================== */}
      <DatePicker
        ref={datepickerRef}
        selected={activeField === "start" ? startDate : endDate}
        onChange={handleDateChange}
        minDate={activeField === "end" && startDate ? startDate : new Date()}
        withPortal
        className="hidden"
      />
    </div>
  );
};

export default Center;