// hooks/usePayment.js
// ─────────────────────────────────────────────────────────────
// Fluxo com PaySuite (hosted page):
//
//   1. Frontend chama initiatePayment()
//   2. Backend cria sessão no PaySuite e devolve { paymentUrl }
//   3. Frontend redireciona para paymentUrl (página do PaySuite)
//   4. Utilizador paga na página do PaySuite (Visa, M-Pesa, e-Mola)
//   5. PaySuite redireciona para returnUrl (/payment-confirmation)
//   6. Backend recebe webhook do PaySuite e confirma a reserva
//   7. Frontend lê os query params e mostra o estado final
//
// ─────────────────────────────────────────────────────────────
// 🚧 DEV — Modo simulação sem backend
// Remove o bloco DEV quando o backend estiver pronto.
// ─────────────────────────────────────────────────────────────

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

// 🚧 DEV — chave localStorage
const DEV_STORAGE_KEY = (email) =>
  email ? `minhasReservas_${email}` : "minhasReservas_guest";

export function usePayment() {
  const { user } = useAuth();
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState(null);

  // ── initiatePayment ───────────────────────────────────────
  // Inicia o pagamento via PaySuite.
  // Retorna { success, paymentUrl } para o componente redirecionar.
  const initiatePayment = async ({ bookingId, totalPrice, houseName, startDate, endDate, guests }) => {
    setErrorMessage(null);
    setStatus("loading");

    try {
      // BACKEND: POST /api/payments/initiate
      // Body: { bookingId, totalPrice, houseName, startDate, endDate, guests }
      // Response: { paymentUrl: "https://checkout.paysuite.com/pay/xxx" }
      //
      // O backend:
      //   1. Cria a sessão no PaySuite com o valor e a returnUrl
      //   2. A returnUrl deve ser: `${FRONTEND_URL}/payment-confirmation`
      //   3. Devolve o paymentUrl gerado pelo PaySuite
      const res = await fetch(`${import.meta.env.VITE_API_URL}/payments/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ bookingId, totalPrice, houseName, startDate, endDate, guests }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Erro ao iniciar pagamento.");
      }

      const { paymentUrl } = await res.json();
      setStatus("redirecting");
      return { success: true, paymentUrl };

    } catch (err) {

      // 🚧 DEV — Simula redirecionamento para PaySuite sem backend
      // Remove este bloco quando o backend estiver pronto.
      console.warn("Backend indisponível — modo DEV ativo");

      const devBookingId = bookingId || `DEV-${Date.now()}`;

      // Guarda reserva no localStorage para aparecer em MinhasReservas
      const storageKey = DEV_STORAGE_KEY(user?.email);
      const reservaParaGuardar = {
        id:            devBookingId,
        houseId:       null, // não temos aqui — vem do state da página
        startDate,
        endDate,
        guests,
        totalPrice,
        method:        "PaySuite (DEV)",
        status:        "pendente",
        paymentStatus: "pre_authorized",
        paidAt:        new Date().toISOString(),
        source:        "dev",
      };

      const existentes = JSON.parse(localStorage.getItem(storageKey) || "[]");
      existentes.push(reservaParaGuardar);
      localStorage.setItem(storageKey, JSON.stringify(existentes));

      // Simula o redirect do PaySuite de volta para o site
      const devPaymentUrl = `/payment-confirmation?status=success&bookingId=${devBookingId}&dev=true`;

      setStatus("redirecting");
      return { success: true, paymentUrl: devPaymentUrl };
      // 🚧 fim DEV

      // Linha abaixo só executa com backend real (não DEV):
      // setStatus("error");
      // setErrorMessage(err.message || "Erro ao iniciar pagamento.");
      // return { success: false, error: err.message };
    }
  };

  const reset = () => {
    setStatus("idle");
    setErrorMessage(null);
  };

  return { initiatePayment, status, errorMessage, reset };
}