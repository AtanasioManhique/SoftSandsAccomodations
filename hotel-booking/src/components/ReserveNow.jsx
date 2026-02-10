import React, { useState, useEffect } from "react";
import PaymentMethods from "../FormDropDown/PaymentMethods";
import PaymentCardForm from "../FormDropDown/PaymentCardForm";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import fullstar from "../assets/fullstar.png";
import {useTranslation} from "react-i18next"

export default function ReserveAgora() {
  const navigate = useNavigate();
  const location = useLocation();
  const { houseId: routeHouseId } = useParams();
  const {t} = useTranslation();

  // 1) tentar receber via state
  const stateData = location.state || {};

  // 2) tentar receber via localStorage
  const stored = JSON.parse(localStorage.getItem("preReserva")) || {};

  // 3) escolher a fonte
  const houseId = stateData.houseId || stored.houseId || Number(routeHouseId);
  const startDate = stateData.startDate || stored.startDate;
  const endDate = stateData.endDate || stored.endDate;
  const guests = stateData.guests || stored.guests;
  const totalPrice = stateData.totalPrice || stored.totalPrice;

  const [house, setHouse] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showMethods, setShowMethods] = useState(false);
  const [showVisaForm, setShowVisaForm] = useState(false);

  // 4) verificar se os dados existem
  if (!houseId || !startDate || !endDate || !totalPrice) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-red-600 text-lg font-semibold">
          {t("reservenow.error")}
        </p>
      </div>
    );
  }

  // salvar no localStorage como backup
  useEffect(() => {
    const reserva = {
      houseId,
      startDate,
      endDate,
      guests,
      totalPrice,
    };
    localStorage.setItem("preReserva", JSON.stringify(reserva));
  }, [houseId, startDate, endDate, guests, totalPrice]);

  // 5) carregar a casa real via JSON
  useEffect(() => {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((houses) => {
        const found = houses.find((h) => Number(h.id) === Number(houseId));
        setHouse(found);
      })
      .catch((e) => console.error("Erro ao carregar casas:", e));
  }, [houseId]);

  if (!house) {
    return (
      <p className="text-center mt-10 text-gray-700 text-lg font-medium">
       {t("reservenow.loading")}
      </p>
    );
  }

  const handleSelectMethod = (method) => {
    setPaymentMethod(method);
    if (method === "Visa") setShowVisaForm(true);
    if (method === "M-Pesa") alert("Pagamento M-Pesa pendente de implementação.");
  };

  const handlePaymentSuccess = () => {
    // salvar em bookings
    const bookings = JSON.parse(localStorage.getItem("bookings")) || [];

    const newBooking = {
      id: Date.now(),
      houseId,
      startDate,
      endDate,
      guests,
      totalPrice,
      status: "confirmado",
    };

    bookings.push(newBooking);
    localStorage.setItem("bookings", JSON.stringify(bookings));

    // limpar preReserva
    localStorage.removeItem("preReserva");

    navigate("/minhasreservas");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 pt-30">
      <h1 className="text-2xl font-bold text-center mb-6">
       {t("reservenow.payment")}
      </h1>

      <div className="max-w-3xl mx-auto grid md:grid-cols-2 gap-6">
        {/* ESQUERDA */}
        <div className="bg-white p-5 rounded-xl shadow-sm space-y-5 border">
          <h2 className="text-lg font-semibold">{t("reservenow.method")}</h2>

          <button
            onClick={() => setShowMethods(true)}
            className="w-full py-3 rounded-lg bg-black text-white font-semibold"
          >
            Choose payment method
          </button>

          {paymentMethod && (
            <p className="text-gray-700">
              {t("reservenow.selected")}:{" "}
              <span className="font-semibold">{paymentMethod}</span>
            </p>
          )}

          <div className="border-t pt-4">
            <h3 className="font-medium">{t("reservenow.details")}</h3>
            <p>
              <strong>{t("center.entrydate")}:</strong> {startDate}
            </p>
            <p>
              <strong>{t("center.outdate")}:</strong> {endDate}
            </p>
            <p>
              <strong>{t("center.guests")}:</strong> {guests}
            </p>
            <p>
              <strong>Total:</strong> {totalPrice} {house.price.currency}
            </p>
          </div>
        </div>

        {/* DIREITA */}
        <div className="bg-white shadow-sm rounded-xl overflow-hidden border">
          <img
            src={house.image?.[0]}
            alt={house.name}
            className="h-56 w-full object-cover"
          />

          <div className="p-4 space-y-2">
            

            <span className="text-gray-500 text-lg flex items-center"><img src={fullstar} className="w-4 h-4"/> {house.rating}</span>

            <p className="text-gray-700 text-sm">{house.location}</p>

            <div className="mt-3 p-3 bg-gray-100 rounded-lg">
              <p className="font-semibold">{t("reservenow.totalprice")}</p>
              <p className="text-xl font-bold">{totalPrice} {house.price.currency}</p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL MÉTODOS */}
      {showMethods && (
        <PaymentMethods
          onClose={() => setShowMethods(false)}
          onSelectVisa={() => {
            setShowMethods(false);
            handleSelectMethod("Visa");
          }}
          onSelectMpesa={() => {
            setShowMethods(false);
            handleSelectMethod("M-Pesa");
          }}
        />
      )}

      {/* FORMULÁRIO VISA */}
      {showVisaForm && (
        <PaymentCardForm
          onClose={() => setShowVisaForm(false)}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  );
}
