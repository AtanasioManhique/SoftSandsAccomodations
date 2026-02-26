// pages/ReserveAgora.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePayment } from "../Payments/usePayments";
import PaymentMethods from "../FormDropDown/PaymentMethods";
import fullstar from "../assets/fullstar.png";

export default function ReserveAgora() {
  const navigate = useNavigate();
  const location = useLocation();
  const { houseId: routeHouseId } = useParams();
  const { t } = useTranslation();
  const { processPayment, status, errorMessage } = usePayment();

  // ── Dados da reserva ──────────────────────────────────────
  const stateData = location.state || {};
  const stored = JSON.parse(localStorage.getItem("preReserva")) || {};

  const houseId    = stateData.houseId    || stored.houseId    || Number(routeHouseId);
  const startDate  = stateData.startDate  || stored.startDate;
  const endDate    = stateData.endDate    || stored.endDate;
  const guests     = stateData.guests     || stored.guests;
  const totalPrice = stateData.totalPrice || stored.totalPrice;

  const [house, setHouse]               = useState(null);
  const [showMethods, setShowMethods]   = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Guardar pré-reserva
  useEffect(() => {
    if (houseId && startDate && endDate && totalPrice) {
      localStorage.setItem("preReserva", JSON.stringify({ houseId, startDate, endDate, guests, totalPrice }));
    }
  }, [houseId, startDate, endDate, guests, totalPrice]);

  // Buscar dados da casa
  useEffect(() => {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((houses) => {
        const found = houses.find((h) => Number(h.id) === Number(houseId));
        setHouse(found);
      });
  }, [houseId]);

  // ── Handler de pagamento ──────────────────────────────────
  const handleSelectMethod = async (method) => {
    setSelectedMethod(method);
    setShowMethods(false);

    const result = await processPayment({ houseId, startDate, endDate, guests, totalPrice, method });

    if (result.success) {
      // Limpa a pré-reserva e navega para a página de confirmação
      localStorage.removeItem("preReserva");
      navigate("/payment-confirmation", { state: result.data });
    }
  };

  // ── Guards ────────────────────────────────────────────────
  if (!houseId || !startDate || !endDate || !totalPrice) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-600 text-lg font-semibold">{t("reservenow.error")}</p>
      </div>
    );
  }

  if (!house) {
    return (
      <p className="text-center mt-10 text-gray-700 text-lg font-medium">{t("reservenow.loading")}</p>
    );
  }

  const isLoading = status === "loading";

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-30">
      <h1 className="text-2xl font-bold text-center mb-6">{t("reservenow.payment")}</h1>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">

        {/* ── Coluna esquerda: pagamento ── */}
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-5 border">
          <h2 className="text-lg font-semibold">{t("reservenow.method")}</h2>

          <button
            onClick={() => !isLoading && setShowMethods(true)}
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-black hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t("reservenow.processing") || "A processar..." : t("location.method")}
          </button>

          {/* Loading spinner */}
          {isLoading && (
            <div className="flex flex-col items-center gap-2 py-2">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500">
                {t("reservenow.processingMsg") || "A confirmar o seu pagamento..."}
              </p>
            </div>
          )}

          {/* Método selecionado */}
          {selectedMethod && !isLoading && (
            <p className="text-gray-700">
              {t("reservenow.selected")}:
              <span className="font-semibold ml-1">{selectedMethod}</span>
            </p>
          )}

          {/* Erro */}
          {status === "error" && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}

          {/* Detalhes da reserva */}
          <div className="border-t pt-4 text-sm space-y-1">
            <h3 className="font-medium text-base mb-2">{t("reservenow.details")}</h3>
            <p><strong>Entrada:</strong> {startDate}</p>
            <p><strong>Saída:</strong> {endDate}</p>
            <p><strong>Hóspedes:</strong> {guests}</p>
            <p><strong>Total:</strong> {totalPrice}</p>
          </div>
        </div>

        {/* ── Coluna direita: card da casa ── */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border">
          <img src={house.image?.[0]} alt={house.name} className="h-56 w-full object-cover" />
          <div className="p-4 space-y-2">
            <span className="text-gray-500 text-lg flex items-center gap-1">
              <img src={fullstar} className="w-4 h-4" alt="star" />
              {house.rating}
            </span>
            <p className="text-gray-700 text-sm">{house.location}</p>
            <div className="mt-3 p-3 bg-gray-100 rounded-lg text-center">
              <p className="font-semibold text-gray-600">{t("reservenow.totalprice")}</p>
              <p className="text-xl font-bold text-black">{totalPrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de métodos ── */}
      {showMethods && (
        <PaymentMethods
          onClose={() => setShowMethods(false)}
          onSelectVisa={() => handleSelectMethod("Visa")}
          onSelectMpesa={() => handleSelectMethod("M-Pesa")}
          onSelectEmola={() => handleSelectMethod("e-Mola")}
        />
      )}
    </div>
  );
}
