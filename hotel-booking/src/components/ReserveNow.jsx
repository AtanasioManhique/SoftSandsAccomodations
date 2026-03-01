// pages/ReserveAgora.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePayment } from "../Payments/usePayments";
import PaymentMethods from "../FormDropDown/PaymentMethods";
import fullstar from "../assets/fullstar.png";

// Mensagens por fase do pagamento
const statusMessages = {
  verifying: {
    label: "A verificar método de pagamento...",
    sublabel: "Estamos a validar os seus dados.",
  },
  reserving: {
    label: "A reservar o valor...",
    sublabel: "O valor será reservado mas não debitado agora.",
  },
};

export default function ReserveAgora() {
  const navigate = useNavigate();
  const location = useLocation();
  const { houseId: routeHouseId } = useParams();
  const { t } = useTranslation();
  const { processPayment, status, errorMessage } = usePayment();

  const stateData = location.state || {};
  const stored = JSON.parse(localStorage.getItem("preReserva")) || {};

  const houseId    = stateData.houseId    || stored.houseId    || Number(routeHouseId);
  const startDate  = stateData.startDate  || stored.startDate;
  const endDate    = stateData.endDate    || stored.endDate;
  const guests     = stateData.guests     || stored.guests;
  const totalPrice = stateData.totalPrice || stored.totalPrice;

  const [house, setHouse]             = useState(null);
  const [showMethods, setShowMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  useEffect(() => {
    if (houseId && startDate && endDate && totalPrice) {
      localStorage.setItem("preReserva", JSON.stringify({ houseId, startDate, endDate, guests, totalPrice }));
    }
  }, [houseId, startDate, endDate, guests, totalPrice]);

  useEffect(() => {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((houses) => {
        const found = houses.find((h) => Number(h.id) === Number(houseId));
        setHouse(found);
      });
  }, [houseId]);

  const handleSelectMethod = async (method) => {
    setSelectedMethod(method);
    setShowMethods(false);

    const result = await processPayment({ houseId, startDate, endDate, guests, totalPrice, method });

    if (result.success) {
      localStorage.removeItem("preReserva");
      navigate("/payment-confirmation", { state: result.data });
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
      <p className="text-center mt-10 text-gray-700 text-lg font-medium">{t("reservenow.loading")}</p>
    );
  }

  const isLoading = status === "verifying" || status === "reserving";
  const currentMessage = statusMessages[status];

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-30">
      <h1 className="text-2xl font-bold text-center mb-6">{t("reservenow.payment")}</h1>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">

        {/* ── Coluna esquerda ── */}
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-5 border">
          <h2 className="text-lg font-semibold">{t("reservenow.method")}</h2>

          {/* Aviso de pré-autorização */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
            <strong>Como funciona?</strong> O valor será apenas <strong>reservado</strong> no seu método de pagamento e não debitado imediatamente. O débito ocorre somente após a confirmação da reserva pelo administrador.
          </div>

          <button
            onClick={() => !isLoading && setShowMethods(true)}
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-black hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "A processar..." : t("location.method")}
          </button>

          {/* Loading com fases */}
          {isLoading && currentMessage && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{currentMessage.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{currentMessage.sublabel}</p>
              </div>

              {/* Barra de progresso visual */}
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-black transition-all duration-700 ${
                    status === "verifying" ? "w-1/2" : "w-full"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-400">
                {status === "verifying" ? "Passo 1 de 2" : "Passo 2 de 2"}
              </p>
            </div>
          )}

          {/* Método selecionado */}
          {selectedMethod && !isLoading && (
            <p className="text-gray-700 text-sm">
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