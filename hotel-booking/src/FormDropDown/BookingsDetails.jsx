import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useSeasonPricing } from "../context/seasonPricing"; // ✅ hook central

export default function ReservaDetalhes() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();
  const { getNightPrice, getTotalPrice } = useSeasonPricing(); // ✅

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d
      .toLocaleString("pt-PT", { month: "short" })
      .toUpperCase();
    return `${day} ${month}`;
  };

  const getStatusColor = (status) => {
    if (status === "confirmado") return "bg-green-100 text-green-700";
    if (status === "pendente") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  useEffect(() => {
    Promise.all([
      fetch("/data/bookings.json").then((res) => res.json()),
      fetch("/data/casas.json").then((res) => res.json()),
    ]).then(([bookingsData, casasData]) => {
      const foundBooking = bookingsData.find(
        (b) => b.id === Number(id)
      );
      if (!foundBooking) return;

      const foundHouse = casasData.find(
        (c) => c.id === foundBooking.houseId
      );

      setBooking(foundBooking);
      setHouse(foundHouse);
      setLoading(false);
    });
  }, [id]);

  if (loading)
    return (
      <div className="p-10 text-center text-gray-500">
        {t("bookingdetails.loading")}
      </div>
    );

  if (!booking || !house)
    return (
      <div className="p-10 text-center text-red-500">
        {t("bookingdetails.notfound")}
      </div>
    );

  // ✅ preços centralizados
  const { formatted: nightlyFormatted } = getNightPrice(
    house.price,
    booking.startDate
  );

  const { nights, formatted: totalFormatted } = getTotalPrice(
    house.price,
    booking.startDate,
    booking.endDate
  );

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4">
      <Link
        to="/minhasreservas"
        className="text-blue-600 underline"
      >
        ← {t("bookingdetails.back")}
      </Link>

      <div className="mt-8 flex flex-col md:flex-row md:items-center md:gap-4">
        <h1 className="text-3xl font-bold mb-2 md:mb-0">
          {t("bookingdetails.details")}
        </h1>

        <span
          className={`px-3 py-1 rounded-full text-sm font-semibold self-start md:self-center ${getStatusColor(
            booking.status
          )}`}
        >
          {booking.status.toUpperCase()}
        </span>
      </div>

      {/* Imagens */}
      <div className="w-full overflow-x-auto whitespace-nowrap rounded-xl shadow mb-10 mt-6">
        {house.image.map((img, index) => (
          <img
            key={index}
            src={img}
            alt="Casa"
            className="inline-block w-80 h-60 object-cover mr-2 rounded-xl"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ESQUERDA */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">
            {t("bookingdetails.information")}
          </h2>

          <div className="flex items-center gap-3 mb-5">
            <div className="text-lg font-bold">
              {formatDate(booking.startDate)}
            </div>
            <div className="text-gray-500 text-xl">→</div>
            <div className="text-lg font-bold">
              {formatDate(booking.endDate)}
            </div>
          </div>

          <div className="space-y-3 text-gray-700">
            <p>
              <strong>{t("center.entrydate")}:</strong>{" "}
              {booking.startDate}
            </p>
            <p>
              <strong>{t("center.outdate")}:</strong>{" "}
              {booking.endDate}
            </p>
            <p>
              <strong>{t("center.guests")}:</strong>{" "}
              {booking.guests}
            </p>
            <p>
              <strong>{t("bookingdetails.nights")}:</strong>{" "}
              {nights}
            </p>
          </div>
        </div>

        {/* DIREITA */}
        <div className="bg-white p-6 rounded-2xl shadow border">
          <h2 className="text-xl font-semibold mb-4">
            {t("bookingdetails.summary")}
          </h2>

          <div className="flex justify-between mb-2 text-gray-700">
            <span>{t("bookingdetails.pernight")}:</span>
            <strong>{nightlyFormatted}</strong>
          </div>

          <div className="flex justify-between mb-2 text-gray-700">
            <span>{t("bookingdetails.nights")}:</span>
            <strong>{nights}</strong>
          </div>

          <hr className="my-3" />

          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{totalFormatted}</span>
          </div>

          <button
            className="w-full mt-6 py-3 bg-gray-600 text-white rounded-xl font-semibold"
            onClick={() =>
              alert("O cancelamento será ligado ao backend futuramente.")
            }
          >
            {t("bookingdetails.cancellation")}
          </button>
        </div>
      </div>
    </div>
  );
}
