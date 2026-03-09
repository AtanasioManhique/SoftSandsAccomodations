import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { useTranslation } from "react-i18next";

// ── Skeleton ──────────────────────────────────────────────────
// O Center tem dados estáticos (destinos hardcoded),
// mas mostra skeleton para consistência visual durante
// o primeiro render da página.
// ─────────────────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, rgba(255,255,255,0.3) 25%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.3) 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmerWhite 1.4s infinite",
};

const CenterSkeleton = () => (
  <div className="flex flex-col items-start justify-center
    px-4 md:px-14 lg:px-22 xl:px-30 min-h-[90vh]
    bg-[url('/src/assets/backgroundimage.png')]
    bg-no-repeat bg-cover bg-center text-white pt-10 md:pt-0 -mb-9"
  >
    <style>{`@keyframes shimmerWhite { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

    {/* Título */}
    <div style={{ ...shimmerStyle, width: "340px", height: "48px", borderRadius: "8px", marginBottom: "12px" }} />
    <div style={{ ...shimmerStyle, width: "240px", height: "48px", borderRadius: "8px", marginBottom: "16px" }} />

    {/* Subtítulo */}
    <div style={{ ...shimmerStyle, width: "420px", height: "18px", borderRadius: "6px", marginBottom: "6px" }} />
    <div style={{ ...shimmerStyle, width: "300px", height: "18px", borderRadius: "6px", marginBottom: "24px" }} />

    {/* Formulário skeleton — desktop */}
    <div className="hidden md:flex bg-white/20 backdrop-blur rounded-lg px-3 py-3 gap-3 w-full max-w-[900px]">
      {[180, 160, 160, 100].map((w, i) => (
        <div key={i} style={{ width: `${w}px` }}>
          <div style={{ ...shimmerStyle, width: "80px", height: "14px", borderRadius: "4px", marginBottom: "6px" }} />
          <div style={{ ...shimmerStyle, width: "100%", height: "34px", borderRadius: "6px" }} />
        </div>
      ))}
      <div style={{ ...shimmerStyle, width: "80px", height: "42px", borderRadius: "6px", alignSelf: "flex-end" }} />
    </div>

    {/* Formulário skeleton — mobile */}
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
  const [destinos, setDestinos] = useState([]);
  const [selectedDestino, setSelectedDestino] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const datepickerRef = useRef(null);

  useEffect(() => {
    setDestinos([
      { id: 1, nome: "Ponta de Ouro" },
      { id: 2, nome: "Bilene" },
      { id: 3, nome: "Ponta Mamoli" },
      { id: 4, nome: "Praia do Tofo" },
      { id: 5, nome: "Ponta Malongane" },
      { id: 6, nome: "Ilha de Inhaca" },
    ]);
    setLoading(false);
  }, []);

  if (loading) return <CenterSkeleton />;

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ destino: selectedDestino, entrada: startDate, saida: endDate });
  };

  const openCalendar = (field) => {
    setActiveField(field);
    datepickerRef.current.setOpen(true);
  };

  return (
    <div className="flex flex-col items-start justify-center
      px-4 md:px-14 lg:px-22 xl:px-30 min-h-[90vh]
      bg-[url('/src/assets/backgroundimage.png')]
      bg-no-repeat bg-cover bg-center text-white pt-10 md:pt-0 -mb-9"
    >
      <h1 className="font-playfair text-3xl md:text-5xl font-bold max-w-xl mt-4">
        {t("center.title")}
      </h1>

      <p className="max-w-130 mt-2 text-sm md:text-base">
        {t("center.subtitle")}
      </p>

      {/* ==================== DESKTOP ==================== */}
      <form
        onSubmit={handleSubmit}
        className="hidden md:flex bg-white text-gray-700 rounded-lg px-3 py-3
        flex-row items-center gap-3 mt-6 w-full max-w-[900px]"
      >
        <div className="flex flex-col w-[180px]">
          <label className="text-sm font-medium mb-1">{t("center.destiny")}</label>
          <select
            className="rounded border border-gray-200 px-3 py-1.5 text-sm outline-none"
            value={selectedDestino}
            onChange={(e) => setSelectedDestino(e.target.value)}
            required
          >
            <option value="">{t("center.destinyselector")}</option>
            {destinos.map((d) => (
              <option key={d.id} value={d.nome}>{d.nome}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-[160px]">
          <label className="text-sm font-medium mb-1">{t("center.entrydate")}</label>
          <div
            onClick={() => openCalendar("start")}
            className="flex items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-sm cursor-pointer"
          >
            <span>{startDate ? startDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
            <Calendar size={16} />
          </div>
        </div>

        <div className="flex flex-col w-[160px]">
          <label className="text-sm font-medium mb-1">{t("center.outdate")}</label>
          <div
            onClick={() => openCalendar("end")}
            className="flex items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-sm cursor-pointer"
          >
            <span>{endDate ? endDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
            <Calendar size={16} />
          </div>
        </div>

        <div className="flex flex-col w-[100px]">
          <label className="text-sm font-medium mb-1">{t("center.guests")}</label>
          <input
            type="number"
            min={1}
            className="rounded border border-gray-200 px-3 py-1.5 text-sm"
            placeholder="0"
            required
          />
        </div>

        <button className="rounded-md bg-black py-2 px-5 text-white h-[42px]">
          {t("center.search")}
        </button>
      </form>

      {/* ==================== MOBILE ==================== */}
      <form
        onSubmit={handleSubmit}
        className="md:hidden bg-white text-gray-700 rounded-lg px-4 py-4
        mt-6 w-full max-w-[360px]"
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">Destino</label>
            <select
              className="rounded border border-gray-200 px-3 py-2 text-sm"
              value={selectedDestino}
              onChange={(e) => setSelectedDestino(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {destinos.map((d) => (
                <option key={d.id} value={d.nome}>{d.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">{t("center.entrydate")}</label>
            <div
              onClick={() => openCalendar("start")}
              className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm cursor-pointer"
            >
              <span>{startDate ? startDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
              <Calendar size={16} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">{t("center.outdate")}</label>
            <div
              onClick={() => openCalendar("end")}
              className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm cursor-pointer"
            >
              <span>{endDate ? endDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
              <Calendar size={16} />
            </div>
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">{t("center.guests")}</label>
            <input
              type="number"
              min={1}
              placeholder="0"
              className="rounded border border-gray-200 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <button className="bg-black text-white rounded py-2 mt-4 w-full">
          {t("center.search")}
        </button>
      </form>

      {/* ==================== DATEPICKER ==================== */}
      <DatePicker
        ref={datepickerRef}
        selected={activeField === "start" ? startDate : endDate}
        onChange={(date) => {
          if (activeField === "start") {
            setStartDate(date);
            if (endDate && date > endDate) setEndDate(null);
          } else {
            if (!startDate || date >= startDate) {
              setEndDate(date);
              datepickerRef.current.setOpen(false);
            }
            return;
          }
          datepickerRef.current.setOpen(false);
        }}
        minDate={activeField === "end" && startDate ? startDate : new Date()}
        withPortal
        className="hidden"
      />
    </div>
  );
};

export default Center;