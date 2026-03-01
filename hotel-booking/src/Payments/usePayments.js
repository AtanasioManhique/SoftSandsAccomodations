// hooks/usePayment.js
// ─────────────────────────────────────────────────────────────
// Simula o fluxo de pré-autorização (Opção 2):
//   Fase 1 — Verificar o método de pagamento
//   Fase 2 — Reservar o valor (pré-autorização)
//
// As reservas são guardadas por utilizador usando o email
// como chave: `minhasReservas_${user.email}`
// Quando o backend estiver pronto, remover todo o bloco
// de localStorage e substituir pelo fetch real.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export function usePayment() {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);

  // Chave única por utilizador — evita que contas diferentes
  // partilhem as mesmas reservas no localStorage.
  // BACKEND: Esta chave deixa de ser necessária quando as reservas
  // forem guardadas na base de dados associadas ao userId.
  const storageKey = user?.email ? `minhasReservas_${user.email}` : "minhasReservas_guest";

  const processPayment = async ({ houseId, startDate, endDate, guests, totalPrice, method }) => {
    setErrorMessage(null);

    try {
      // ── FASE 1: Verificar método de pagamento ─────────────
      setStatus("verifying");

      // ─────────────────────────────────────────────────────
      // MOCK: Simula verificação do cartão/método (1.5s)
      // ─────────────────────────────────────────────────────
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const mockVerifySuccess = true;
      if (!mockVerifySuccess) throw new Error("Método de pagamento inválido (mock).");

      // ─────────────────────────────────────────────────────
      // REAL (PaySuite) — Fase 1:
      // const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/verify-payment-method`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ method, houseId }),
      // });
      // if (!verifyRes.ok) {
      //   const err = await verifyRes.json();
      //   throw new Error(err.message || "Método de pagamento inválido.");
      // }
      // ─────────────────────────────────────────────────────

      // ── FASE 2: Reservar o valor (pré-autorização) ────────
      setStatus("reserving");

      // ─────────────────────────────────────────────────────
      // MOCK: Simula a pré-autorização do valor (2s)
      // ─────────────────────────────────────────────────────
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const mockReserveSuccess = true;
      if (!mockReserveSuccess) throw new Error("Não foi possível reservar o valor (mock).");

      const mockResult = {
        transactionId: `PREAUTH-${Date.now()}`,
        method,
        houseId,
        startDate,
        endDate,
        guests,
        totalPrice,
        paidAt: new Date().toISOString(),
        paymentStatus: "pre_authorized",
      };

      // ─────────────────────────────────────────────────────
      // REAL (PaySuite) — Fase 2:
      // const reserveRes = await fetch(`${import.meta.env.VITE_API_URL}/pre-authorize`, {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ houseId, startDate, endDate, guests, totalPrice, method }),
      // });
      // if (!reserveRes.ok) {
      //   const err = await reserveRes.json();
      //   throw new Error(err.message || "Erro na pré-autorização.");
      // }
      // const mockResult = await reserveRes.json();
      // ─────────────────────────────────────────────────────

      // ── Guardar reserva no localStorage por utilizador ────
      // ─────────────────────────────────────────────────────
      // BACKEND: Remover este bloco quando o backend estiver pronto.
      // O backend persistirá a reserva na base de dados associada
      // ao userId, após confirmar a pré-autorização via webhook.
      // ─────────────────────────────────────────────────────
      const reservaParaGuardar = {
        id: mockResult.transactionId,
        houseId: Number(houseId),
        startDate,
        endDate,
        guests,
        totalPrice,
        method,
        status: "pendente",
        paymentStatus: "pre_authorized",
        paidAt: mockResult.paidAt,
        source: "local",
      };

      const reservasExistentes = JSON.parse(localStorage.getItem(storageKey)) || [];
      reservasExistentes.push(reservaParaGuardar);
      localStorage.setItem(storageKey, JSON.stringify(reservasExistentes));

      setStatus("success");
      return { success: true, data: mockResult };

    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Erro ao processar pagamento.");
      return { success: false, error: error.message };
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMessage(null);
  };

  return { processPayment, status, errorMessage, reset };
}