// pages/PaymentConfirmation.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../services/api";
import { formatCurrency, convertPrice } from "../context/utils/currency";
import { useCurrency } from "../FormDropDown/CurrencyContext";

// ── Fix timezone ──────────────────────────────────────────────
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00");
};

const formatDisplayDate = (dateStr) => {
  if (!dateStr) return "—";
  return parseLocalDate(dateStr).toLocaleDateString("pt-PT", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });
};
// ─────────────────────────────────────────────────────────────

export default function PaymentConfirmation() {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const { t }          = useTranslation();
  // ✅ hook de moeda
  const { currency, rates } = useCurrency();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  const paymentStatus = searchParams.get("status");
  const bookingId     = searchParams.get("bookingId");
  const isDev         = searchParams.get("dev") === "true";

  const isSuccess = paymentStatus === "success";

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data?.data?.booking ?? res.data?.data ?? res.data);
    } catch {
      // silencioso
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Pagamento falhado ─────────────────────────────────────
  if (!isSuccess) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4 pt-24 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-md border max-w-sm w-full mx-auto p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{t("all.conclusion")}</h1>
          <p className="text-gray-500 text-sm">{t("all.payment")}</p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition text-sm"
          >
            {t("all.try")}
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 border-2 border-gray-200 hover:border-gray-400 rounded-xl font-semibold text-gray-700 transition text-sm"
          >
            {t("all.inicio")}
          </button>
        </div>
      </div>
    );
  }

  // ✅ converte o totalPrice do booking (ZAR) para a moeda do utilizador
  const totalPriceZAR  = Number(booking?.totalPrice) || 0;
  const totalConverted = convertPrice(totalPriceZAR, "ZAR", currency, rates);
  const totalFormatted = totalPriceZAR > 0 ? formatCurrency(totalConverted, currency) : (booking?.totalPrice ?? "—");

  // ── Pagamento bem-sucedido ────────────────────────────────
  return (
    <div className="bg-gray-50 py-10 px-4 pt-24">
      <div className="bg-white rounded-2xl shadow-md border max-w-sm w-full mx-auto p-6 text-center space-y-4">

        <div className="flex justify-center pt-1">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">{t("all.submit")}!</h1>
          <p className="text-gray-500 text-xs mt-1">{t("all.pay")}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left space-y-1">
          <p className="text-xs font-semibold text-yellow-800">⏳ {t("all.aguarda")}</p>
          <p className="text-xs text-yellow-700 leading-relaxed">{t("all.notified")}</p>
        </div>

        {/* Detalhes da reserva */}
        {booking && (
          <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2 text-sm border">
            <Row label="Referência" value={booking.id}                           small />
            <Row label="Entrada"    value={formatDisplayDate(booking.startDate)}        />
            <Row label="Saída"      value={formatDisplayDate(booking.endDate)}          />
            <Row label="Hóspedes"   value={booking.guests}                              />
            {/* ✅ total convertido e formatado na moeda do utilizador */}
            <Row label="Total"      value={totalFormatted}                        bold  />
            {booking.paidAt && (
              <Row
                label="Data"
                value={new Date(booking.paidAt).toLocaleString("pt-PT", {
                  dateStyle: "long", timeStyle: "short",
                })}
              />
            )}
          </div>
        )}

        {isDev && (
          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
            🚧 Modo DEV — simulação de pagamento sem backend real
          </p>
        )}

        <button
          onClick={() => navigate("/minhasreservas")}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition text-sm"
        >
          {t("all.reserves")}
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full py-2.5 border-2 border-gray-200 hover:border-gray-400 rounded-xl font-semibold text-gray-700 transition text-sm"
        >
          {t("all.inicio")}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold = false, small = false }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-800 text-right break-all ${bold ? "font-bold" : "font-medium"} ${small ? "text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}