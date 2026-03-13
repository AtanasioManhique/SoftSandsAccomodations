// pages/ReserveAgora.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { usePayment } from "../Payments/usePayments";
import PaymentMethods from "../FormDropDown/PaymentMethods";
import fullstar from "../assets/fullstar.png";

// ── Helpers de localStorage com try/catch ─────────────────────
// Previne crash em modo privado/incógnito onde localStorage é bloqueado
const safeGetStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : {};
  } catch {
    return {};
  }
};

const safeSetStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // silencioso — modo privado não suporta localStorage
  }
};

const safeRemoveStorage = (key) => {
  try {
    localStorage.removeItem(key);
  } catch {
    // silencioso
  }
};
// ─────────────────────────────────────────────────────────────

// Mensagens por fase do pagamento — usar t() quando backend estiver pronto
// ── BACKEND: mover estas strings para i18n ────────────────────
// reservenow.verifying.label / reservenow.verifying.sublabel
// reservenow.reserving.label / reservenow.reserving.sublabel
// ─────────────────────────────────────────────────────────────
const getStatusMessages = (t) => ({
  verifying: {
    label:    t("reservenow.verifying.label")    || "A verificar método de pagamento...",
    sublabel: t("reservenow.verifying.sublabel") || "Estamos a validar os seus dados.",
  },
  reserving: {
    label:    t("reservenow.reserving.label")    || "A reservar o valor...",
    sublabel: t("reservenow.reserving.sublabel") || "O valor será reservado mas não debitado agora.",
  },
});

export default function ReserveAgora() {
  const navigate = useNavigate();
  const location = useLocation();
  const { houseId: routeHouseId } = useParams();
  const { t } = useTranslation();
  const { processPayment, status, errorMessage } = usePayment();

  const stateData = location.state || {};
  const stored    = safeGetStorage("preReserva");

  const houseId    = stateData.houseId    || stored.houseId    || Number(routeHouseId);
  const startDate  = stateData.startDate  || stored.startDate;
  const endDate    = stateData.endDate    || stored.endDate;
  const guests     = stateData.guests     || stored.guests;
  const totalPrice = stateData.totalPrice || stored.totalPrice;

  const [house, setHouse]           = useState(null);
  const [showMethods, setShowMethods] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(null);

  // Persiste dados no localStorage enquanto o backend não está pronto
  useEffect(() => {
    if (houseId && startDate && endDate && totalPrice) {
      safeSetStorage("preReserva", { houseId, startDate, endDate, guests, totalPrice });
    }
  }, [houseId, startDate, endDate, guests, totalPrice]);

  useEffect(() => {
    if (!houseId) return;

    // ── BACKEND: GET /api/casas/:houseId ──────────────────
    // Descomentar quando o backend estiver pronto e apagar o fetch abaixo:
    // fetch(`/api/casas/${houseId}`, { credentials: "include" })
    //   .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
    //   .then((data) => setHouse(data))
    //   .catch(() => setHouse(null));
    // ─────────────────────────────────────────────────────

    // Temporário — lê do ficheiro JSON estático:
    fetch("/data/casas.json")
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then((houses) => {
        const found = houses.find((h) => Number(h.id) === Number(houseId));
        setHouse(found || null);
      })
      .catch(() => setHouse(null));
  }, [houseId]);

  const handleSelectMethod = async (method) => {
    setSelectedMethod(method);
    setShowMethods(false);

    // ── BACKEND: POST /api/reservas ───────────────────────
    // processPayment encapsula a lógica de pagamento.
    // Quando o backend estiver pronto, garantir que processPayment
    // envia para o endpoint correto em usePayments.js
    // ─────────────────────────────────────────────────────
    const result = await processPayment({ houseId, startDate, endDate, guests, totalPrice, method });

    if (result.success) {
      safeRemoveStorage("preReserva");
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
      <div className="min-h-screen flex justify-center items-center flex-col gap-3">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 text-base font-medium">{t("reservenow.loading")}</p>
      </div>
    );
  }

  const isLoading      = status === "verifying" || status === "reserving";
  const statusMessages = getStatusMessages(t);
  const currentMessage = statusMessages[status];

  return (
    // Corrigido: pt-30 não é classe Tailwind standard → pt-[7.5rem] equivalente
    <div className="min-h-screen bg-gray-50 p-4 pt-[7.5rem]">
      <h1 className="text-2xl font-bold text-center mb-6">{t("reservenow.payment")}</h1>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">

        {/* Coluna esquerda */}
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-5 border">
          <h2 className="text-lg font-semibold">{t("reservenow.method")}</h2>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 leading-relaxed">
            <strong>{t("reservenow.howworks.title") || "Como funciona?"}</strong>{" "}
            {t("reservenow.howworks.body") || "O valor será apenas reservado no seu método de pagamento e não debitado imediatamente. O débito ocorre somente após a confirmação da reserva pelo administrador."}
          </div>

          <button
            onClick={() => !isLoading && setShowMethods(true)}
            disabled={isLoading}
            className="w-full py-3 rounded-lg font-semibold text-white bg-black hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? (t("reservenow.processing") || "A processar...")
              : t("location.method")}
          </button>

          {isLoading && currentMessage && (
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
              <div className="text-center">
                <p className="text-sm font-semibold text-gray-800">{currentMessage.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{currentMessage.sublabel}</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className={`h-1.5 rounded-full bg-black transition-all duration-700 ${
                    status === "verifying" ? "w-1/2" : "w-full"
                  }`}
                />
              </div>
              <p className="text-xs text-gray-400">
                {status === "verifying"
                  ? (t("reservenow.step1") || "Passo 1 de 2")
                  : (t("reservenow.step2") || "Passo 2 de 2")}
              </p>
            </div>
          )}

          {selectedMethod && !isLoading && (
            <p className="text-gray-700 text-sm">
              {t("reservenow.selected")}:
              <span className="font-semibold ml-1">{selectedMethod}</span>
            </p>
          )}

          {status === "error" && (
            <p className="text-red-500 text-sm font-medium">{errorMessage}</p>
          )}

          <div className="border-t pt-4 text-sm space-y-1">
            <h3 className="font-medium text-base mb-2">{t("reservenow.details")}</h3>
            <p><strong>{t("reservenow.checkin")  || "Entrada"}:</strong> {startDate}</p>
            <p><strong>{t("reservenow.checkout") || "Saída"}:</strong>   {endDate}</p>
            <p><strong>{t("reservenow.guests")   || "Hóspedes"}:</strong> {guests}</p>
            <p><strong>{t("reservenow.total")    || "Total"}:</strong>    {totalPrice}</p>
          </div>
        </div>

        {/* Coluna direita: card da casa */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border">
          <img
            src={house.image?.[0]}
            alt={house.name || house.location}
            className="h-56 w-full object-cover"
          />
          <div className="p-4 space-y-2">
            <span className="text-gray-500 text-lg flex items-center gap-1">
              <img src={fullstar} className="w-4 h-4" alt="" />
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