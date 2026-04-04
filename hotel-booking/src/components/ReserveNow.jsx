// pages/ReserveAgora.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePayment } from "../Payments/usePayments";
import fullstar from "../assets/fullstar.png";
import { api } from "../services/api";

// ── Fix timezone — mesmo utilitário do HouseDetails ───────────
// Evita shift de dia ao converter "YYYY-MM-DD" para Date.
// new Date("2025-08-10") interpreta como UTC e pode mostrar "2025-08-09"
// em fusos horários negativos. Com "T00:00:00" força horário local.
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00");
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "—";
  const date = parseLocalDate(dateStr);
  return date.toLocaleDateString("pt-PT", {
    day:   "2-digit",
    month: "2-digit",
    year:  "numeric",
  });
};
// ─────────────────────────────────────────────────────────────

// ── Helpers localStorage ──────────────────────────────────────
const safeGetStorage = (key) => {
  try { const item = localStorage.getItem(key); return item ? JSON.parse(item) : {}; }
  catch { return {}; }
};
const safeSetStorage = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const safeRemoveStorage = (key) => {
  try { localStorage.removeItem(key); } catch {}
};
// ─────────────────────────────────────────────────────────────

export default function ReserveAgora() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { houseId: routeHouseId } = useParams();
  const { t }     = useTranslation();
  const { initiatePayment, status, errorMessage } = usePayment();

  const stateData  = location.state || {};
  const stored     = safeGetStorage("preReserva");

  const bookingId  = stateData.id            || stateData.bookingId  || stored.bookingId;
  const houseId    = stateData.accommodationId || stored.houseId     || Number(routeHouseId);
  const startDate  = stateData.startDate     || stored.startDate;
  const endDate    = stateData.endDate       || stored.endDate;
  const guests     = stateData.guests        || stored.guests;
  const totalPrice = stateData.totalPrice    || stored.totalPrice;
  const houseName  = stateData.houseName     || stored.houseName;

  const [house, setHouse] = useState(null);

  // Persiste dados enquanto o backend não está pronto
  useEffect(() => {
    if (houseId && startDate && endDate && totalPrice) {
      safeSetStorage("preReserva", { bookingId, houseId, startDate, endDate, guests, totalPrice, houseName });
    }
  }, [bookingId, houseId, startDate, endDate, guests, totalPrice, houseName]);

  // Carrega dados da casa para mostrar o resumo
  useEffect(() => {
    if (!houseId) return;
    const load = async () => {
      try {
        // BACKEND: GET /api/accommodations/:id
        const res = await api.get(`/accommodations/${houseId}`);
        setHouse(res.data?.data ?? res.data);
      } catch {
        /* // 🚧 DEV — fallback JSON + localStorage
        try {
          const res  = await fetch("/data/casas.json");
          const list = await res.json();
          const found = list.find((h) => Number(h.id) === Number(houseId));
          setHouse(found || null);
        } catch { setHouse(null); }
      
      }
    };
    load();
  }, [houseId]);

  const handlePay = async () => {
    const result = await initiatePayment({
      bookingId,
      accommodationId: houseId,
      images:          house?.image ?? [],
      totalPrice,
      houseName,
      startDate,
      endDate,
      guests,
    });

    if (result.success) {
      safeRemoveStorage("preReserva");
      window.location.href = result.paymentUrl;
    }
  };

  if (!houseId || !startDate || !endDate || !totalPrice) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-600 text-lg font-semibold">{t("reservenow.error")}</p>
      </div>
    );
  }

  if (!house) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col gap-3">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 text-base font-medium">{t("reservenow.loading")}</p>
      </div>
    );
  }

  const isLoading = status === "loading" || status === "redirecting";

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-[7.5rem]">
      <h1 className="text-2xl font-bold text-center mb-6">{t("reservenow.payment")}</h1>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">

        {/* Coluna esquerda — resumo + botão pagar */}
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-5 border">
          <h2 className="text-lg font-semibold">{t("reservenow.details")}</h2>

          {/* Detalhes da reserva */}
          <div className="text-sm space-y-2 text-gray-700">
            <div className="flex justify-between">
              <span className="text-gray-500">{t("center.entrydate")}</span>
              {/* ✅ fix timezone: parseLocalDate evita shift de dia */}
              <span className="font-medium">{formatDisplayDate(startDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("center.outdate")}</span>
              {/* ✅ fix timezone: parseLocalDate evita shift de dia */}
              <span className="font-medium">{formatDisplayDate(endDate)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">{t("center.guests")}</span>
              <span className="font-medium">{guests}</span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="font-semibold text-gray-900">Total</span>
              <span className="font-bold text-gray-900 text-base">{totalPrice}</span>
            </div>
          </div>

          {/* Informação sobre o PaySuite */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed space-y-1">
            <p className="font-semibold">{t("paysuite.title")}</p>
            <p>{t("paysuite.subtitle")} <strong>Visa, M-Pesa ou e-Mola</strong>.</p>
          </div>

          {/* Logos dos métodos aceites */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">{t("paysuite.Aceita")}:</span>
            <div className="flex items-center gap-2">
              <img src="/icons/visa1.png"              alt="Visa"   className="h-6 object-contain" />
              <img src="/icons/m-pesa-seeklogo.png"    alt="M-Pesa" className="h-6 object-contain" />
              <img src="/icons/emola.png"              alt="e-Mola" className="h-6 object-contain" />
            </div>
          </div>

          {/* Botão pagar */}
          <button
            onClick={handlePay}
            disabled={isLoading}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {status === "redirecting" ? t("paysuite.process") : t("paysuite.pro")}
              </>
            ) : (
              `Pagar ${totalPrice}`
            )}
          </button>

          {status === "error" && (
            <p className="text-red-500 text-sm font-medium text-center">{errorMessage}</p>
          )}

          <p className="text-xs text-gray-400 text-center">
            {t("paysuite.direcc")}
          </p>
        </div>

        {/* Coluna direita — card da casa */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border">
          <img
            src={house.image?.[0]}
            alt={house.location}
            className="h-56 w-full object-cover"
          />
          <div className="p-4 space-y-2">
            <span className="text-gray-500 text-sm flex items-center gap-1">
              <img src={fullstar} className="w-4 h-4" alt="" />
              {house.rating}
            </span>
            <p className="text-gray-700 text-sm">{house.location}</p>
            <div className="mt-3 p-3 bg-gray-50 rounded-xl text-center border">
              <p className="text-xs font-medium text-gray-500 mb-1">{t("reservenow.totalprice")}</p>
              <p className="text-xl font-bold text-gray-900">{totalPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}