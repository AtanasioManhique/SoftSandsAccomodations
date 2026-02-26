import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MinhasReservas() {
  const [activeBookings, setActiveBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t } = useTranslation();

  useEffect(() => {
    loadReservas();
  }, []);

  function loadReservas() {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((housesData) => {
        // ─────────────────────────────────────────────────────
        // BACKEND: Substituir o bloco abaixo por:
        // const res = await fetch(`/api/reservas?userId=${user.id}`);
        // const reservasLocais = await res.json();
        // As reservas virão da base de dados com status
        // atualizado pelo administrador em tempo real.
        // ─────────────────────────────────────────────────────
        const reservasLocais = JSON.parse(localStorage.getItem("minhasReservas")) || [];

        const reservas = reservasLocais.map((r) => ({
          ...r,
          house: housesData.find((h) => h.id === Number(r.houseId)),
        }));

        setActiveBookings(
          reservas.filter((b) => b.status === "confirmado" || b.status === "pendente")
        );
        setCanceledBookings(
          reservas.filter((b) => b.status === "cancelado")
        );
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar:", err);
        setLoading(false);
      });
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        {t("bookings.loading")}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mt-8 mb-3">
        {t("bookings.myreserves")}
      </h1>

      {/* RESERVAS ATIVAS */}
      <h2 className="text-2xl font-semibold mb-4">
        {t("bookings.activereserves")}
      </h2>

      {activeBookings.length === 0 ? (
        <p className="text-gray-500 mb-10">{t("bookings.nonactive")}</p>
      ) : (
        <div className="space-y-5 mb-10">
          {activeBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} t={t} />
          ))}
        </div>
      )}

      {/* CANCELADAS */}
      <h2 className="text-2xl font-semibold mt-4 mb-4">
        {t("bookings.cancellation")}
      </h2>

      {canceledBookings.length === 0 ? (
        <p className="text-gray-500">{t("bookings.noncancellation")}</p>
      ) : (
        <div className="space-y-5">
          {canceledBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} t={t} canceled />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, t, canceled = false }) {
  return (
    <div className={`flex rounded-2xl overflow-hidden flex-col md:flex-row shadow-md hover:shadow-lg transition ${canceled ? "bg-gray-100" : "bg-white"}`}>
      <img
        src={booking.house?.image?.[0]}
        alt="Casa"
        className="w-full md:w-40 h-48 md:h-40 object-cover"
      />
      <div className="p-4 flex flex-col justify-between w-full">
        <div className="flex items-start justify-between gap-2">
          <h2 className={`text-xl font-semibold ${canceled ? "text-gray-500" : ""}`}>
            {booking.house?.location}
          </h2>
          <StatusBadge status={booking.status} />
        </div>
        <p className="text-gray-500 text-sm mt-1">
          {booking.startDate} → {booking.endDate}
        </p>
        <p className="text-gray-700 font-medium mt-2">
          Total: <span className="font-bold">{booking.totalPrice}</span>
        </p>
        <div className="mt-3 pt-3 border-t">
          <Link
            to={`/reservas/${booking.id}`}
            state={{ booking }}
            className="text-gray-600 font-semibold hover:underline text-sm"
          >
            {t("bookings.details")}
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    confirmado: "bg-green-100 text-green-700",
    pendente:   "bg-yellow-100 text-yellow-700",
    cancelado:  "bg-red-100 text-red-700",
  };
  const labels = {
    confirmado: "Confirmado",
    pendente:   "Pendente",
    cancelado:  "Cancelado",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${styles[status] || "bg-gray-100 text-gray-600"}`}>
      {labels[status] || status}
    </span>
  );s
}