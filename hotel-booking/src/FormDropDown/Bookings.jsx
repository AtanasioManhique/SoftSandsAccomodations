// FormDropDown/Bookings.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const BookingCardSkeleton = () => (
  <div style={{
    display: "flex",
    flexDirection: "row",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    background: "#fff",
  }}>
    <div style={{ ...shimmerStyle, width: "160px", minWidth: "160px", height: "160px" }} />
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ ...shimmerStyle, width: "160px", height: "22px", borderRadius: "6px" }} />
        <div style={{ ...shimmerStyle, width: "80px", height: "22px", borderRadius: "20px" }} />
      </div>
      <div style={{ ...shimmerStyle, width: "200px", height: "14px", borderRadius: "4px" }} />
      <div style={{ ...shimmerStyle, width: "120px", height: "14px", borderRadius: "4px" }} />
      <div style={{ ...shimmerStyle, width: "100px", height: "14px", borderRadius: "4px", marginTop: "auto" }} />
    </div>
  </div>
);

const MinhasReservasSkeleton = () => (
  <div className="w-full max-w-4xl mx-auto py-10 px-4">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{ ...shimmerStyle, width: "240px", height: "36px", borderRadius: "8px", marginBottom: "16px", marginTop: "32px" }} />
    <div style={{ ...shimmerStyle, width: "180px", height: "28px", borderRadius: "6px", marginBottom: "16px" }} />
    <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "40px" }}>
      <BookingCardSkeleton />
      <BookingCardSkeleton />
    </div>
    <div style={{ ...shimmerStyle, width: "160px", height: "28px", borderRadius: "6px", marginBottom: "16px" }} />
    <BookingCardSkeleton />
  </div>
);
// ─────────────────────────────────────────────────────────────

// ── Normaliza a reserva para um formato consistente ──────────
// Garante que tanto reservas vindas do backend como do localStorage
// têm sempre os mesmos campos (houseId, images, location, etc.)
const normalizeBooking = (raw, housesData = []) => {
  // O backend devolve accommodationId; o localStorage pode ter houseId ou accommodationId
  const houseId = raw.accommodationId ?? raw.houseId;

  // Tenta encontrar a casa no JSON local (modo DEV / fallback)
  const localHouse = housesData.find(
    (h) => String(h.id) === String(houseId)
  );

  // O backend pode devolver a casa embutida em raw.house ou raw.accommodation
  const embeddedHouse = raw.house ?? raw.accommodation ?? null;

  return {
    id:              raw.id ?? raw._id,
    houseId,
    // Imagem: backend embutida → JSON local → array vazio
    images:          embeddedHouse?.image ?? localHouse?.image ?? raw.images ?? [],
    // Localização: backend embutida → JSON local → fallback genérico
    location:        embeddedHouse?.location ?? localHouse?.location ?? raw.houseName ?? raw.location ?? "Casa",
    startDate:       raw.startDate ?? raw.checkIn,
    endDate:         raw.endDate   ?? raw.checkOut,
    guests:          raw.guests,
    totalPrice:      raw.totalPrice,
    status:          raw.status ?? "pendente",
    method:          raw.method ?? raw.paymentMethod ?? null,
  };
};
// ─────────────────────────────────────────────────────────────

export default function MinhasReservas() {
  const [activeBookings,   setActiveBookings]   = useState([]);
  const [canceledBookings, setCanceledBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const { t }    = useTranslation();
  const { user } = useAuth();

  // Chave localStorage usada no modo DEV
  const storageKey = user?.email
    ? `minhasReservas_${user.email}`
    : "minhasReservas_guest";

  useEffect(() => { loadReservas(); }, [user]);

  async function loadReservas() {
    setLoading(true);
    try {
      // ── BACKEND: GET /api/bookings (utilizador autenticado) ──
      // O backend filtra automaticamente pelo token JWT.
      // A resposta deve ser um array de reservas com a casa embutida
      // (ou pelo menos accommodationId para o frontend enriquecer).
      //
      // Exemplo de resposta esperada:
      // [
      //   {
      //     id: "uuid",
      //     accommodationId: 5,
      //     accommodation: { id: 5, location: "Ponta de Ouro", image: ["https://..."] },
      //     startDate: "2025-09-01",
      //     endDate:   "2025-09-05",
      //     guests:    2,
      //     totalPrice: "2.200 MZN",
      //     status:    "confirmado",
      //   }, ...
      // ]
      const res      = await api.get("/bookings");
      const rawList  = res.data?.data ?? res.data ?? [];
      const bookings = rawList.map((r) => normalizeBooking(r));
      split(bookings);
    } catch {
      // 🚧 DEV — Fallback: lê do localStorage e enriquece com casas.json
      try {
        const housesData   = await fetch("/data/casas.json").then((r) => r.json());
        const devCasas     = JSON.parse(localStorage.getItem("dev_casas_admin") || "[]");
        const allHouses    = [...housesData, ...devCasas];
        const reservasRaw  = JSON.parse(localStorage.getItem(storageKey)) || [];
        const bookings     = reservasRaw.map((r) => normalizeBooking(r, allHouses));
        split(bookings);
      } catch (err) {
        console.error("Erro ao carregar reservas:", err);
      }
      // 🚧 fim DEV
    } finally {
      setLoading(false);
    }
  }

  function split(bookings) {
    setActiveBookings(
      bookings.filter((b) => b.status === "confirmado" || b.status === "pendente")
    );
    setCanceledBookings(
      bookings.filter((b) => b.status === "cancelado")
    );
  }

  if (loading) return <MinhasReservasSkeleton />;

  return (
    <div className="w-full max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mt-8 mb-3">{t("bookings.myreserves")}</h1>

      {/* RESERVAS ATIVAS */}
      <h2 className="text-2xl font-semibold mb-4">{t("bookings.activereserves")}</h2>
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
      <h2 className="text-2xl font-semibold mt-4 mb-4">{t("bookings.cancellation")}</h2>
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
  const image = booking.images?.[0];

  return (
    <div className={`flex rounded-2xl overflow-hidden flex-col md:flex-row shadow-md hover:shadow-lg transition ${canceled ? "bg-gray-100" : "bg-white"}`}>
      {/* Imagem da casa */}
      {image ? (
        <img
          src={image}
          alt={booking.location}
          className="w-full md:w-40 h-48 md:h-40 object-cover"
        />
      ) : (
        <div className="w-full md:w-40 h-48 md:h-40 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shrink-0">
          <span className="text-4xl">🏠</span>
        </div>
      )}

      <div className="p-4 flex flex-col justify-between w-full">
        <div className="flex items-start justify-between gap-2">
          <h2 className={`text-xl font-semibold ${canceled ? "text-gray-500" : ""}`}>
            {booking.location}
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
  );
}