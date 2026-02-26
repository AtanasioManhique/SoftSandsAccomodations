// hooks/usePayment.js
// ─────────────────────────────────────────────────────────────
// Simulação de pagamento com delay.
// Quando o backend estiver pronto, basta substituir o bloco
// "MOCK" pelo fetch real ao PaySuite (ver comentários abaixo).
// ─────────────────────────────────────────────────────────────

import { useState } from "react";

export function usePayment() {
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMessage, setErrorMessage] = useState(null);

  const processPayment = async ({ houseId, startDate, endDate, guests, totalPrice, method }) => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      // ─────────────────────────────────────────────────────
      // MOCK: Simula um delay de 2.5s e retorna sucesso.
      // ─────────────────────────────────────────────────────
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const mockSuccess = true; // muda para false para testar erro

      if (!mockSuccess) {
        throw new Error("Pagamento recusado (mock).");
      }

      const mockResult = {
        transactionId: `MOCK-${Date.now()}`,
        method,
        houseId,
        startDate,
        endDate,
        guests,
        totalPrice,
        paidAt: new Date().toISOString(),
      };

      // ─────────────────────────────────────────────────────
      // Guardar reserva no localStorage como "pendente".
      // Quando o backend estiver pronto, esta parte é removida
      // — o backend irá persistir a reserva na base de dados
      // e o frontend apenas fará fetch das reservas do utilizador.
      // ─────────────────────────────────────────────────────
      const reservaParaGuardar = {
        id: mockResult.transactionId,       // id único (virá do backend futuramente)
        houseId: Number(houseId),
        startDate,
        endDate,
        guests,
        totalPrice,
        method,
        status: "pendente",                 // o admin confirma futuramente
        paidAt: mockResult.paidAt,
        source: "local",                    // identificar que veio do localStorage
      };

      const reservasExistentes = JSON.parse(localStorage.getItem("minhasReservas")) || [];
      reservasExistentes.push(reservaParaGuardar);
      localStorage.setItem("minhasReservas", JSON.stringify(reservasExistentes));
      // ─────────────────────────────────────────────────────

      setStatus("success");
      return { success: true, data: mockResult };

      // ─────────────────────────────────────────────────────
      // REAL (PaySuite): Quando o backend estiver pronto,
      // comenta o bloco MOCK acima e descomenta isto:
      // ─────────────────────────────────────────────────────
      /*
      const response = await fetch(`${process.env.REACT_APP_API_URL}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ houseId, startDate, endDate, guests, totalPrice, method }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Erro no servidor.");
      }

      const data = await response.json();

      // PaySuite redireciona para URL externa
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return { success: true, data };
      }

      setStatus("success");
      return { success: true, data };
      */
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