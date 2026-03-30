// pages/PaymentConfirmation.jsx
// ─────────────────────────────────────────────────────────────
// Página de retorno após o PaySuite redirecionar de volta.
//
// O PaySuite redireciona para:
//   /payment-confirmation?status=success&bookingId=xxx
//   /payment-confirmation?status=failed&reason=xxx
//
// BACKEND: Antes de mostrar esta página, o backend já recebeu
// o webhook do PaySuite e atualizou o status da reserva.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { api } from "../services/api";

export default function PaymentConfirmation() {
  const navigate                  = useNavigate();
  const location                  = useLocation();
  const [searchParams]            = useSearchParams();
  const [booking, setBooking]     = useState(null);
  const [loading, setLoading]     = useState(true);

  // PaySuite envia estes query params no redirect de retorno:
  const paymentStatus = searchParams.get("status");    // "success" | "failed"
  const bookingId     = searchParams.get("bookingId");
  const reason        = searchParams.get("reason");    // motivo de falha (se failed)
  const isDev         = searchParams.get("dev") === "true"; // 🚧 DEV

  const isSuccess = paymentStatus === "success";

  useEffect(() => {
    if (!bookingId) { setLoading(false); return; }
    loadBooking();
  }, [bookingId]);

  const loadBooking = async () => {
    try {
      // BACKEND: GET /api/bookings/:id
      // Retorna os detalhes da reserva já confirmada pelo webhook do PaySuite
      const res = await api.get(`/bookings/${bookingId}`);
      setBooking(res.data?.data ?? res.data);
    } catch {
      /* // 🚧 DEV — lê do localStorage
      if (isDev) {
        const allKeys = Object.keys(localStorage).filter((k) => k.startsWith("minhasReservas_"));
        for (const key of allKeys) {
          const reservas = JSON.parse(localStorage.getItem(key) || "[]");
          const found    = reservas.find((r) => r.id === bookingId);
          if (found) { setBooking(found); break; }
        }
      }
      // 🚧 fim DEV */
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
          <h1 className="text-xl font-bold text-gray-900">Pagamento não concluído</h1>
          <p className="text-gray-500 text-sm">
            {reason || "O pagamento não foi processado. Podes tentar novamente."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition text-sm"
          >
            Tentar novamente
          </button>
          <button
            onClick={() => navigate("/")}
            className="w-full py-2.5 border-2 border-gray-200 hover:border-gray-400 rounded-xl font-semibold text-gray-700 transition text-sm"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    );
  }

  // ── Pagamento bem-sucedido ────────────────────────────────
  return (
    <div className="bg-gray-50 py-10 px-4 pt-24">
      <div className="bg-white rounded-2xl shadow-md border max-w-sm w-full mx-auto p-6 text-center space-y-4">

        {/* Ícone sucesso */}
        <div className="flex justify-center pt-1">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">Reserva submetida!</h1>
          <p className="text-gray-500 text-xs mt-1">
            O pagamento foi processado com sucesso pelo PaySuite.
          </p>
        </div>

        {/* Banner pendente */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left space-y-1">
          <p className="text-xs font-semibold text-yellow-800">⏳ Aguarda confirmação</p>
          <p className="text-xs text-yellow-700 leading-relaxed">
            A sua reserva está <strong>pendente</strong>. Será notificado assim que o administrador confirmar. Pode acompanhar o estado em <strong>Minhas Reservas</strong>.
            {/*
              BACKEND: Notificação automática por email/push
              será enviada quando o admin confirmar a reserva.
            */}
          </p>
        </div>

        {/* Detalhes da reserva */}
        {booking && (
          <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2 text-sm border">
            <Row label="Referência" value={booking.id}          small />
            <Row label="Entrada"    value={booking.startDate}            />
            <Row label="Saída"      value={booking.endDate}              />
            <Row label="Hóspedes"   value={booking.guests}               />
            <Row label="Total"      value={booking.totalPrice}    bold   />
            {booking.paidAt && (
              <Row label="Data" value={new Date(booking.paidAt).toLocaleString("pt-PT", { dateStyle: "long", timeStyle: "short" })} />
            )}
          </div>
        )}

        {/* 🚧 DEV badge */}
        {isDev && (
          <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-1.5">
            🚧 Modo DEV — simulação de pagamento sem backend real
          </p>
        )}

        {/* Botões */}
        <button
          onClick={() => navigate("/minhasreservas")}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition text-sm"
        >
          Ver Minhas Reservas
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full py-2.5 border-2 border-gray-200 hover:border-gray-400 rounded-xl font-semibold text-gray-700 transition text-sm"
        >
          Voltar ao início
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