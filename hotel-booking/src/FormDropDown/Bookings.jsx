import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {useTranslation} from "react-i18next"
export default function MinhasReservas() {
  const [activeBookings, setActiveBookings] = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const {t} = useTranslation();
  // Preço com base na temporada
  const getSeasonPrice = (housePrice, checkInDate) => {
    const month = new Date(checkInDate).getMonth() + 1;
    const isLowSeason = month >= 2 && month <= 9;
    return isLowSeason ? housePrice.low_season : housePrice.high_season;
  };

  useEffect(() => {
    async function loadData() {
      try {
        const bookingsRes = await fetch("/data/bookings.json");
        const housesRes = await fetch("/data/casas.json");

        const bookingsData = await bookingsRes.json();
        const housesData = await housesRes.json();

        const joinedBookings = bookingsData.map((b) => ({
          ...b,
          house: housesData.find((h) => h.id === b.houseId),
        }));

        setActiveBookings(
          joinedBookings.filter(
            (b) => b.status === "confirmado" || b.status === "pendente"
          )
        );
        setCanceledBookings(
          joinedBookings.filter(
            (b) => b.status === "cancelado" || b.status === "canceled"
          )
        );

        setLoading(false);
      } catch (err) {
        console.error("Erro ao carregar:", err);
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-500">
        {t("bookings.loading")}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mt-8 mb-3">{t("bookings.myreserves")}</h1>

      {/* RESERVAS ATIVAS */}
      <h2 className="text-2xl font-semibold mb-4">{t("bookings.activereserves")}</h2>

      {activeBookings.length === 0 ? (
        <p className="text-gray-500 mb-10">{t("bookings.nonactive")}</p>
      ) : (
        <div className="space-y-5">
          {activeBookings.map((booking) => {
            const seasonPrice = getSeasonPrice(
              booking.house.price,
              booking.startDate
            );

            return (
              <div
                key={booking.id}
                className="flex bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition flex-col md:flex-row"
              >
                <img
                  src={booking.house.image?.[0]}
                  alt="Casa"
                  className="w-full md:w-40 h-48 md:h-40 object-cover"
                />

                <div className="p-4 flex flex-col justify-between w-full">
                  {/* TÍTULO */}
                  <h2 className="text-xl font-semibold">
                    {booking.house.location}
                  </h2>

                  {/* DATAS */}
                  <p className="text-gray-600 text-sm mt-1">
                    {booking.startDate} → {booking.endDate}
                  </p>

                  {/* PREÇO */}
                  <p className="text-gray-700 font-medium mt-3">
                    Total:{" "}
                    <span className="font-bold">
                      {seasonPrice} {booking.house.price.currency}
                    </span>
                  </p>

                  {/* LINK VER DETALHES */}
                  <div className="mt-3 pt-3 border-t">
                    <Link
                      to={`/reservas/${booking.id}`}
                      className="text-gray-600 font-semibold hover:underline text-sm"
                    >
                      {t("bookings.details")}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RESERVAS CANCELADAS */}
      <h2 className="text-2xl font-semibold mt-12 mb-4">
      {t("bookings.cancellation")}
      </h2>

      {canceledBookings.length === 0 ? (
        <p className="text-gray-500">{t("bookings.noncancellation")}</p>
      ) : (
        <div className="space-y-5">
          {canceledBookings.map((booking) => (
            <div
              key={booking.id}
              className="flex bg-gray-100 shadow rounded-2xl overflow-hidden flex-col md:flex-row"
            >
              <img
                src={booking.house.image?.[0]}
                className="w-full md:w-40 h-48 md:h-40 object-cover"
              />

              <div className="p-4 w-full">
                <h2 className="text-lg font-semibold text-gray-700">
                  {booking.house.location}
                </h2>

                <p className="text-gray-500 text-sm mt-1">
                  {booking.startDate} → {booking.endDate}
                </p>

                <div className="mt-3 pt-3 border-t">
                  <Link
                    to={`/reservas/${booking.id}`}
                    className="text-gray-600 text-sm font-semibold hover:underline"
                  >
                    {t("bookings.details")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
