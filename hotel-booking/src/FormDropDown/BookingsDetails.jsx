import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const ReservaDetalhesSkeleton = () => (
  <div className="w-full max-w-5xl mx-auto py-10 px-4">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

    {/* Voltar */}
    <div style={{ ...shimmerStyle, width: "120px", height: "16px", borderRadius: "4px", marginBottom: "32px" }} />

    {/* Título + badge */}
    <div style={{ display: "flex", gap: "16px", alignItems: "center", marginBottom: "24px" }}>
      <div style={{ ...shimmerStyle, width: "220px", height: "36px", borderRadius: "8px" }} />
      <div style={{ ...shimmerStyle, width: "90px", height: "28px", borderRadius: "20px" }} />
    </div>

    {/* Galeria de imagens */}
    <div style={{ display: "flex", gap: "8px", overflowX: "hidden", marginBottom: "40px" }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ ...shimmerStyle, minWidth: "320px", height: "240px", borderRadius: "12px" }} />
      ))}
    </div>

    {/* Grid dois cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Card esquerdo */}
      <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ ...shimmerStyle, width: "180px", height: "22px", borderRadius: "6px" }} />
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div style={{ ...shimmerStyle, width: "60px", height: "22px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "20px", height: "16px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "60px", height: "22px", borderRadius: "4px" }} />
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ ...shimmerStyle, width: i % 2 === 0 ? "80%" : "65%", height: "14px", borderRadius: "4px" }} />
        ))}
      </div>

      {/* Card direito */}
      <div style={{ background: "#fff", padding: "24px", borderRadius: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", border: "1px solid #eee", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ ...shimmerStyle, width: "140px", height: "22px", borderRadius: "6px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ ...shimmerStyle, width: "80px", height: "16px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "40px", height: "16px", borderRadius: "4px" }} />
        </div>
        <div style={{ ...shimmerStyle, width: "100%", height: "1px", borderRadius: "1px" }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ ...shimmerStyle, width: "60px", height: "22px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "100px", height: "22px", borderRadius: "4px" }} />
        </div>
        <div style={{ ...shimmerStyle, width: "100%", height: "48px", borderRadius: "12px" }} />
        <div style={{ ...shimmerStyle, width: "100%", height: "44px", borderRadius: "12px" }} />
      </div>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────

export default function ReservaDetalhes() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { t } = useTranslation();
  const { user } = useAuth();

  // BACKEND: Remover quando as reservas vierem da API
  const storageKey = user?.email ? `minhasReservas_${user.email}` : "minhasReservas_guest";

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("pt-PT", { month: "short" }).toUpperCase();
    return `${day} ${month}`;
  };

  const getStatusColor = (status) => {
    if (status === "confirmado") return "bg-green-100 text-green-700";
    if (status === "pendente") return "bg-yellow-100 text-yellow-700";
    return "bg-red-100 text-red-700";
  };

  useEffect(() => {
    async function loadData() {
      try {
        const housesData = await fetch("/data/casas.json").then((r) => r.json());

        // ─────────────────────────────────────────────────────
        // BACKEND: Substituir por:
        // const res = await fetch(`/api/reservas/${id}`, {
        //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        // });
        // const foundBooking = await res.json();
        // ─────────────────────────────────────────────────────

        // 1. Via navigation state
        if (location.state?.booking) {
          const b = location.state.booking;
          setBooking(b);
          setHouse(housesData.find((c) => c.id === Number(b.houseId)));
          setLoading(false);
          return;
        }

        // 2. Fallback localStorage
        const reservasLocais = JSON.parse(localStorage.getItem(storageKey)) || [];
        const localBooking = reservasLocais.find((r) => r.id === id);

        if (localBooking) {
          setBooking(localBooking);
          setHouse(housesData.find((c) => c.id === Number(localBooking.houseId)));
          setLoading(false);
          return;
        }

        setLoading(false);
      } catch (err) {
        console.error("Erro:", err);
        setLoading(false);
      }
    }

    loadData();
  }, [id, location.state, storageKey]);

  function handleCancelar() {
    // ─────────────────────────────────────────────────────
    // BACKEND: Substituir por:
    // await fetch(`/api/reservas/${booking.id}/cancelar`, {
    //   method: "PATCH",
    //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    // });
    // ─────────────────────────────────────────────────────
    const reservas = JSON.parse(localStorage.getItem(storageKey)) || [];
    const atualizadas = reservas.map((r) =>
      r.id === booking.id ? { ...r, status: "cancelado" } : r
    );
    localStorage.setItem(storageKey, JSON.stringify(atualizadas));
    setBooking((prev) => ({ ...prev, status: "cancelado" }));
    setShowCancelModal(false);
  }

  if (loading) return <ReservaDetalhesSkeleton />;

  if (!booking || !house)
    return <div className="p-10 text-center text-red-500">{t("bookingdetails.notfound")}</div>;

  const nights = calcNights(booking.startDate, booking.endDate);
  const isCanceled = booking.status === "cancelado";

  return (
    <div className="w-full max-w-5xl mx-auto py-10 px-4">
      <Link to="/minhasreservas" className="text-blue-600 underline">
        ← {t("bookingdetails.back")}
      </Link>

      <div className="mt-8 flex flex-col md:flex-row md:items-center md:gap-4">
        <h1 className="text-3xl font-bold mb-2 md:mb-0">{t("bookingdetails.details")}</h1>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold self-start md:self-center ${getStatusColor(booking.status)}`}>
          {booking.status.toUpperCase()}
        </span>
      </div>

      {/* Banner pendente */}
      {booking.status === "pendente" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-800">
          ⏳ A sua reserva está pendente de confirmação pelo administrador.
        </div>
      )}

      {/* Galeria */}
      <div className="w-full overflow-x-auto whitespace-nowrap rounded-xl shadow mb-10 mt-6">
        {house.image.map((img, index) => (
          <img key={index} src={img} alt="Casa"
            className="inline-block w-80 h-60 object-cover mr-2 rounded-xl" />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ESQUERDA */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-xl font-semibold mb-4">{t("bookingdetails.information")}</h2>

          <div className="flex items-center gap-3 mb-5">
            <div className="text-lg font-bold">{formatDate(booking.startDate)}</div>
            <div className="text-gray-500 text-xl">→</div>
            <div className="text-lg font-bold">{formatDate(booking.endDate)}</div>
          </div>

          <div className="space-y-3 text-gray-700">
            <p><strong>{t("center.entrydate")}:</strong> {booking.startDate}</p>
            <p><strong>{t("center.outdate")}:</strong> {booking.endDate}</p>
            <p><strong>{t("center.guests")}:</strong> {booking.guests}</p>
            <p><strong>{t("bookingdetails.nights")}:</strong> {nights}</p>
            <p><strong>Método de pagamento:</strong> {booking.method}</p>
            <p><strong>Referência:</strong> <span className="text-xs break-all">{booking.id}</span></p>
          </div>
        </div>

        {/* DIREITA */}
        <div className="bg-white p-6 rounded-2xl shadow border space-y-4">
          <h2 className="text-xl font-semibold">{t("bookingdetails.summary")}</h2>

          <div className="flex justify-between text-gray-700">
            <span>{t("bookingdetails.nights")}:</span>
            <strong>{nights}</strong>
          </div>

          <hr />

          <div className="flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span>{booking.totalPrice}</span>
          </div>

          {!isCanceled && (
            <button onClick={() => setShowCancelModal(true)}
              className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition">
              {t("bookingdetails.cancellation")}
            </button>
          )}

          <Link to="/politicacancelamento"
            className="flex items-center justify-center gap-2 w-full py-2.5 border-2 border-gray-300 hover:border-black rounded-xl text-sm font-semibold text-gray-700 hover:text-black transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Ler política de cancelamento
          </Link>
        </div>
      </div>

      {/* Modal cancelamento */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4 text-center">
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cancelar reserva?</h2>
            <p className="text-gray-500 text-sm">Tem a certeza que deseja cancelar? Esta ação não pode ser desfeita.</p>
            <Link to="/politicacancelamento" className="block text-sm text-blue-600 underline"
              onClick={() => setShowCancelModal(false)}>
              Consultar política de cancelamento antes de decidir
            </Link>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowCancelModal(false)}
                className="flex-1 py-2.5 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-gray-400 transition">
                Voltar
              </button>
              <button onClick={handleCancelar}
                className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition">
                Confirmar cancelamento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function calcNights(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.round((end - start) / (1000 * 60 * 60 * 24));
}