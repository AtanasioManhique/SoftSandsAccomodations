// src/pages/HouseDetails.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import locationicon from "../assets/location.png";
import fullstar from "../assets/fullstar.png";
import GaleriaCasa from "./GaleriaCasa";
import HouseReviews from "./HouseReviews";
import { useTranslation } from "react-i18next";
import { useSeasonPricing } from "../context/seasonPricing";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLoginModal } from "../context/LoginModalContext";
import { api } from "../services/api";

// ─────────────────────────────────────────────────────────────
/* // 🚧 DEV — Lê casas adicionadas pelo admin no localStorage
// Remove quando o backend estiver pronto.
const DEV_KEY = "dev_casas_admin";
const devGetCasas = () => {
  try { return JSON.parse(localStorage.getItem(DEV_KEY)) || []; }
  catch { return []; }
};
// 🚧 fim bloco DEV ──────────────────────────────────────────── */

// ── Utilitário de data (fix timezone) ────────────────────────
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00"); // sem Z = horário local, evita shift de dia
};

const formatLocalDate = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};
// ─────────────────────────────────────────────────────────────

// ── Skeleton ──────────────────────────────────────────────────
const SkeletonBox = ({ width = "100%", height = "16px", borderRadius = "6px", className = "" }) => (
  <div
    className={className}
    style={{
      width, height, borderRadius,
      background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
    }}
  />
);

const HouseDetailsSkeleton = () => (
  <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 space-y-10">
    <style>{`
      @keyframes shimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }
    `}</style>
    <div className="flex items-center gap-3">
      <SkeletonBox width="60px" height="20px" />
      <SkeletonBox width="120px" height="20px" />
    </div>
    <SkeletonBox width="100%" height="360px" borderRadius="16px" />
    <div className="border-b pb-8">
      <SkeletonBox width="200px" height="24px" className="mb-6" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBox width="24px" height="24px" borderRadius="50%" />
            <SkeletonBox width="80px" height="16px" />
          </div>
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <SkeletonBox width="120px" height="24px" className="mb-3" />
      <SkeletonBox width="100%" height="16px" />
      <SkeletonBox width="90%" height="16px" />
      <SkeletonBox width="75%" height="16px" />
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <SkeletonBox width="100%" height="280px" borderRadius="16px" />
      <SkeletonBox width="100%" height="280px" borderRadius="16px" />
    </div>
  </div>
);

// ── Google Maps Embed ─────────────────────────────────────────
const MapEmbed = ({ lat, lng, locationName }) => {
  const googleMapsUrl           = `https://www.google.com/maps?q=${lat},${lng}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div style={{
      height: "100%", minHeight: "300px", borderRadius: "16px",
      overflow: "hidden", boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      border: "1px solid #e5e7eb", display: "flex", flexDirection: "column",
    }}>
      <div style={{ flex: 1, position: "relative" }}>
        <iframe
          title={`Mapa - ${locationName}`}
          width="100%" height="100%"
          style={{ border: 0, display: "block" }}
          loading="lazy" allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        />
      </div>
      <div style={{ display: "flex", gap: "10px", padding: "12px 16px", background: "#fff", borderTop: "1px solid #f0f0f0" }}>
        <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "#1a1a2e", color: "white", borderRadius: "10px", padding: "10px 0", fontSize: "13px", fontWeight: "600", textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2d2d4e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2e")}
        >
          <ExternalLink size={14} /> Ver no Google Maps
        </a>
        <a href={googleMapsDirectionsUrl} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "#fff", color: "#1a1a2e", border: "1.5px solid #1a1a2e", borderRadius: "10px", padding: "10px 0", fontSize: "13px", fontWeight: "600", textDecoration: "none", transition: "background 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          🗺️ Como chegar
        </a>
      </div>
    </div>
  );
};

const normalizeAccommodation = (raw) => {
  const id       = raw?.id ?? raw?._id;
  const capacity = raw?.capacity ?? raw?.maxGuests ?? 1;
  return { ...raw, id, capacity };
};

const extractData = (resData) => {
  if (!resData) return null;
  return resData.data ?? resData;
};

const HouseDetails = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { t }        = useTranslation();
  const { getTotalPrice, getNightPrice } = useSeasonPricing();
  const { user }     = useAuth();
  const { openLogin } = useLoginModal();

  const [house, setHouse]             = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(false);
  const [checkIn, setCheckIn]         = useState("");
  const [checkOut, setCheckOut]       = useState("");
  const [guests, setGuests]           = useState(1);
  const [maxGuests, setMaxGuests]     = useState(1);
  const [activeField, setActiveField] = useState(null);
  const datepickerRef                 = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadFromBackend = async () => {
      setLoadingHouse(true);
      try {
        // BACKEND: GET /api/accommodations/:id
        const res        = await api.get(`/accommodations/${id}`);
        const payload    = extractData(res.data);
        const normalized = normalizeAccommodation(payload);
        if (!mounted) return;
        setHouse(normalized);
        setMaxGuests(normalized.capacity || 1);
      } catch (err) {
        console.error("Erro backend:", err);
        try {
          // Fallback 1: casas.json
          const r          = await fetch("/data/casas.json");
          const data       = await r.json();
          const casasArray = Array.isArray(data) ? data : data.casas;
          let found        = casasArray.find((h) => h.id === Number(id));

          /* // 🚧 DEV — Fallback 2: casas adicionadas pelo admin no localStorage
          if (!found) {
            const devCasas = devGetCasas();
            found = devCasas.find((h) => String(h.id) === String(id));
          }
          // 🚧 fim DEV */

          if (found && mounted) {
            setHouse(normalizeAccommodation(found));
            setMaxGuests(found.capacity || 1);
          }
        } catch (e) {
          console.error("Erro fallback:", e);
        }
      } finally {
        if (mounted) setLoadingHouse(false);
      }
    };

    loadFromBackend();
    return () => { mounted = false; };
  }, [id]);

  const houseId = useMemo(() => house?.id ?? house?._id, [house]);

  if (loadingHouse && !house) return <HouseDetailsSkeleton />;
  if (!house) return null;

  const lat            = Number(house.coordinates?.lat);
  const lng            = Number(house.coordinates?.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  const { formatted: nightFormatted } = getNightPrice(house.price, new Date());
  const hasDates  = Boolean(checkIn && checkOut);
  const totalData = hasDates ? getTotalPrice(house.price, checkIn, checkOut) : null;

  const handleReserve = async () => {
    if (!user)                                    { openLogin(); return; }
    if (!checkIn || !checkOut)                    { alert("Por favor selecione datas antes de reservar."); return; }
    if (new Date(checkOut) <= new Date(checkIn))  { alert("A data de saída deve ser depois da data de entrada."); return; }
    if (guests > maxGuests)                       { alert(`Esta casa suporta no máximo ${maxGuests} hóspedes.`); return; }
    if (!houseId)                                 { alert("Erro: accommodationId inválido."); return; }

    try {
      // BACKEND: POST /api/bookings
      // Cria a reserva na BD e retorna o booking com id, totalPrice e status.
      const payload = { accommodationId: houseId, startDate: checkIn, endDate: checkOut, guests };
      const res     = await api.post("/bookings", payload);
      const booking = extractData(res.data);
      const bookingId = booking?.id ?? booking?._id ?? booking?.bookingId;

      const state = {
        ...booking,
        id:              bookingId,
        accommodationId: houseId,
        houseName:       house.location,
        images:          house.image,
        startDate:       checkIn,
        endDate:         checkOut,
        guests,
        totalPrice:      booking?.totalPrice ?? totalData?.formatted,
        status:          booking?.status ?? "pendente",
      };

      navigate(`/pagamento/${bookingId || "pendente"}`, { state });

    } catch (err) {
      /* // ─────────────────────────────────────────────────────
      // 🚧 DEV — Backend indisponível: simula criação da reserva
      // e navega para o ReserveAgora para testar o fluxo de pagamento.
      // Remove este bloco catch quando o backend estiver pronto.
      // O try acima ficará a tratar tudo sozinho com dados reais.
      // ─────────────────────────────────────────────────────
      console.warn("Backend indisponível — modo DEV: simulando reserva");

      const devBookingId = `DEV-${Date.now()}`;

      const state = {
        id:              devBookingId,
        bookingId:       devBookingId,
        accommodationId: houseId,
        houseName:       house.location,
        images:          house.image,
        startDate:       checkIn,
        endDate:         checkOut,
        guests,
        totalPrice:      totalData?.formatted ?? nightFormatted,
        status:          "pendente",
      };

      navigate(`/pagamento/${devBookingId}`, { state });
      // 🚧 fim bloco DEV ────────────────────────────────────── */
    }
  };

  // Casas DEV não têm reviews — evita crash
  const hasReviews = house.reviews && Array.isArray(house.reviews) && house.reviews.length > 0;

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 space-y-10">

      {/* Avaliação e localização */}
      <div className="flex flex-wrap items-center gap-2 text-gray-700 text-lg">
        <div className="flex items-center gap-1">
          <span>{house.rating}</span>
          <img src={fullstar} className="w-5 h-5" alt="star" />
        </div>
        <span className="text-gray-400">•</span>
        <div className="flex items-center gap-1">
          <img src={locationicon} className="w-4 h-4" alt="location" />
          <span>{house.location}</span>
        </div>
      </div>

      {/* Galeria */}
      <GaleriaCasa casa={house} />

      {/* Comodidades */}
      {house.amenities && house.amenities.length > 0 && (
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-6">O que esta casa oferece:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {house.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3">
                <img src={amenity.icon} alt={amenity.name} className="w-6 h-6 object-contain" />
                <span className="text-gray-700 text-sm sm:text-base">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descrição */}
      {house.description && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Descrição</h2>
          <p className="leading-relaxed whitespace-pre-line">{house.description}</p>
        </div>
      )}

      {/* Grid: Reserva + Mapa */}
      <div id="reserveid" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        {/* Formulário de reserva */}
        <div className="bg-white p-4 rounded-xl shadow-md border">
          <div className="font-bold text-xl mb-3">
            {hasDates
              ? `${totalData.formatted} · ${totalData.nights} ${t("bookingdetails.nights")}`
              : `${nightFormatted} / ${t("favorites.night")}`}
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-2 divide-x">
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">{t("center.entrydate")}</label>
                <div onClick={() => { setActiveField("start"); datepickerRef.current?.setOpen(true); }} className="flex items-center justify-between cursor-pointer mt-1">
                  {/* ✅ fix timezone: parseLocalDate evita shift de dia */}
                  <span className="text-sm">{checkIn ? parseLocalDate(checkIn).toLocaleDateString() : "dd/mm/yyyy"}</span>
                  <Calendar size={16} />
                </div>
              </div>
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">{t("center.outdate")}</label>
                <div onClick={() => { setActiveField("end"); datepickerRef.current?.setOpen(true); }} className="flex items-center justify-between cursor-pointer mt-1">
                  {/* ✅ fix timezone: parseLocalDate evita shift de dia */}
                  <span className="text-sm">{checkOut ? parseLocalDate(checkOut).toLocaleDateString() : "dd/mm/yyyy"}</span>
                  <Calendar size={16} />
                </div>
              </div>
            </div>
            <div className="p-2 border-t">
              <label className="text-xs font-semibold uppercase text-gray-600">{t("center.guests")}</label>
              <select className="w-full mt-1" value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
                {[...Array(maxGuests)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>{i + 1} {t("center.guests")}{i + 1 > 1 ? "s" : ""}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleReserve}
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
          >
            {t("center.reserve")}
          </button>
        </div>

        {/* Mapa */}
        {hasCoordinates ? (
          <MapEmbed lat={lat} lng={lng} locationName={house.location} />
        ) : (
          <div className="flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200" style={{ minHeight: "300px" }}>
            <div className="text-center px-6">
              <p className="text-gray-600 mb-2 font-medium">{t("location.avalaibilty")}</p>
              <p className="text-sm text-gray-500">
                {t("location.info")},{" "}
                <span onClick={() => navigate("/contactenos")} className="text-blue-600 underline cursor-pointer">
                  {t("location.contacte")}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* DatePicker oculto */}
      <DatePicker
        ref={datepickerRef}
        selected={
          activeField === "start"
            ? parseLocalDate(checkIn)       // ✅ fix timezone
            : parseLocalDate(checkOut)      // ✅ fix timezone
        }
        onChange={(date) => {
          if (!date) return;

          // ✅ fix timezone: usa getFullYear/getMonth/getDate em vez de toISOString()
          const formatted = formatLocalDate(date);

          if (activeField === "start") {
            setCheckIn(formatted);
            if (checkOut && formatted > checkOut) setCheckOut("");
          } else {
            if (!checkIn || formatted >= checkIn) {
              setCheckOut(formatted);
            }
          }
          datepickerRef.current?.setOpen(false);
        }}
        minDate={
          activeField === "end" && checkIn
            ? parseLocalDate(checkIn)       // ✅ fix timezone
            : new Date()
        }
        withPortal
        className="hidden"
      />

      {/* Reviews — só mostra se tiver (casas DEV não têm) */}
      {hasReviews && <HouseReviews house={house} />}
    </div>
  );
};

export default HouseDetails;