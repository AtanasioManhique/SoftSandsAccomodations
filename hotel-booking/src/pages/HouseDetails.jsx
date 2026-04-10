// src/pages/HouseDetails.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import locationicon from "../assets/location.png";
import GaleriaCasa from "./GaleriaCasa";
import HouseReviews from "./HouseReviews";
import { useTranslation } from "react-i18next";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar, ExternalLink } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLoginModal } from "../context/LoginModalContext";
import { api } from "../services/api";
import { formatCurrency, convertPrice } from "../context/utils/currency";
import { useCurrency } from "../FormDropDown/CurrencyContext";

// ── Mapa de ícones de comodidades (igual ao AdminCasas) ──────
const AMENITY_ICONS = {
  "Wi-Fi":               "/icons/wi-fi.png",
  "Piscina Privada":     "/icons/swimming.png",
  "Estacionamento":      "/icons/car.png",
  "Cozinha Equipada":    "/icons/kitchen.png",
  "Ar-Condicionado":     "/icons/air-conditioner.png",
  "Ventilação":          "/icons/fan.png",
  "Área de Churrasco":   "/icons/barbecue.png",
  "Vista ao Mar":        "/icons/sunset.png",
  "Sala Mobilada":       "/icons/sofa.png",
  "Serviços de Limpeza": "/icons/clean.png",
};

// ── Utilitários de data ──────────────────────────────────────
const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr + "T00:00:00");
};

const formatLocalDate = (date) => {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
};

const calcNights = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return 0;
  const start = parseLocalDate(checkIn);
  const end = parseLocalDate(checkOut);
  return Math.max(0, Math.round((end - start) / (1000 * 60 * 60 * 24)));
};

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
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
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

// ── Mapa ─────────────────────────────────────────────────────
const MapEmbed = ({ lat, lng, locationName }) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
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
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "#1a1a2e", color: "white", borderRadius: "10px", padding: "10px 0", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}
        >
          <ExternalLink size={14} /> Ver no Google Maps
        </a>
        <a href={googleMapsDirectionsUrl} target="_blank" rel="noopener noreferrer"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", background: "#fff", color: "#1a1a2e", border: "1.5px solid #1a1a2e", borderRadius: "10px", padding: "10px 0", fontSize: "13px", fontWeight: "600", textDecoration: "none" }}
        >
          🗺️ Como chegar
        </a>
      </div>
    </div>
  );
};

// ── Normalização ─────────────────────────────────────────────
const normalizeHouse = (raw) => {
  if (!raw) return null;
  const imageUrls = (raw.images ?? []).map((img) => img.url);
  return {
    id:               raw.id,
    name:             raw.name,
    description:      raw.description,
    location:         raw.location,
    beachName:        raw.beachName,
    pricePerNight:    raw.pricePerNight,
    lowSeasonPrice:   raw.lowSeasonPrice,
    highSeasonPrice:  raw.highSeasonPrice,
    peakSeasonPrice:  raw.peakSeasonPrice,
    maxGuests:        raw.maxGuests,
    bedrooms:         raw.bedrooms,
    bathrooms:        raw.bathrooms,
    latitude:         raw.latitude,
    longitude:        raw.longitude,
    amenities:        raw.amenities ?? [],
    image:            imageUrls,
    images:           raw.images ?? [],
    reviews:          raw.reviews ?? [],
  };
};

// ── Componente principal ──────────────────────────────────────
const HouseDetails = () => {
  const { id }        = useParams();
  const navigate      = useNavigate();
  const { t }         = useTranslation();
  const { user }      = useAuth();
  const { openLogin } = useLoginModal();
  const { currency, rates } = useCurrency();

  const [house, setHouse]               = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(true);
  const [checkIn, setCheckIn]           = useState("");
  const [checkOut, setCheckOut]         = useState("");
  const [guests, setGuests]             = useState(1);
  const [activeField, setActiveField]   = useState(null);
  const datepickerRef                   = useRef(null);

  useEffect(() => {
    let mounted = true;
    const loadHouse = async () => {
      setLoadingHouse(true);
      try {
        const res = await api.get(`/accommodations/${id}`);
        const raw = res.data?.data?.accommodation ?? res.data?.data ?? res.data;
        if (mounted) setHouse(normalizeHouse(raw));
      } catch (err) {
        console.error("Erro ao carregar casa:", err);
      } finally {
        if (mounted) setLoadingHouse(false);
      }
    };
    loadHouse();
    return () => { mounted = false; };
  }, [id]);

  if (loadingHouse) return <HouseDetailsSkeleton />;
  if (!house) return (
    <div className="py-28 px-4 text-center text-gray-500">Casa não encontrada.</div>
  );

  const maxGuests      = house.maxGuests || 1;
  const lat            = Number(house.latitude);
  const lng            = Number(house.longitude);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  const nightPriceConverted = convertPrice(house.pricePerNight, "ZAR", currency, rates);
  const nightFormatted      = formatCurrency(nightPriceConverted, currency);
  const nights              = calcNights(checkIn, checkOut);
  const totalZAR            = nights * (house.pricePerNight ?? 0);
  const totalConverted      = convertPrice(totalZAR, "ZAR", currency, rates);
  const totalFormatted      = formatCurrency(totalConverted, currency);
  const hasDates            = Boolean(checkIn && checkOut && nights > 0);

  const handleReserve = async () => {
    if (!user) { openLogin(); return; }
    if (!checkIn || !checkOut) { alert("Por favor selecione datas antes de reservar."); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { alert("A data de saída deve ser depois da data de entrada."); return; }
    if (guests > maxGuests) { alert(`Esta casa suporta no máximo ${maxGuests} hóspedes.`); return; }

    try {
      const payload = { accommodationId: house.id, checkIn, checkOut, guests };
      const res     = await api.post("/bookings", payload);
      const booking = res.data?.data?.booking ?? res.data?.data ?? res.data;
      const bookingId = booking?.id;

      navigate(`/pagamento/${bookingId}`, {
        state: {
          ...booking,
          id:              bookingId,
          accommodationId: house.id,
          houseName:       house.name,
          images:          house.image,
          startDate:       checkIn,
          endDate:         checkOut,
          guests,
          totalPrice:      booking?.totalPrice ?? totalZAR,
          currency:        booking?.currency   ?? "ZAR",
          status:          booking?.status     ?? "pending_payment",
        },
      });
    } catch (err) {
      console.error("Erro ao criar reserva:", err.response?.data ?? err);
      alert(err.response?.data?.error?.message ?? "Erro ao criar reserva. Tenta novamente.");
    }
  };

  const hasReviews = Array.isArray(house.reviews) && house.reviews.length > 0;

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 space-y-10">

      {/* Nome + localização + barra de specs */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{house.name}</h1>
        <div className="flex items-center gap-1 text-gray-600">
          <img src={locationicon} className="w-4 h-4" alt="location" />
          <span>{house.location}{house.beachName ? ` · ${house.beachName}` : ""}</span>
        </div>

        {/* Barra de specs estilo Airbnb */}
        <div className="flex items-stretch w-fit mt-3 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden divide-x divide-gray-100">

          <div className="flex items-center gap-3 px-5 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Hóspedes</p>
              <p className="text-[15px] font-semibold text-gray-900">{house.maxGuests}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Quartos</p>
              <p className="text-[15px] font-semibold text-gray-900">{house.bedrooms}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 px-5 py-3">
            <div className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center shrink-0">
              <svg className="w-[18px] h-[18px] text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h16M4 6h7a5 5 0 0 1 5 5v1H4V6z"/>
                <path d="M4 12v6"/>
                <path d="M20 12v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/>
                <line x1="8" y1="18" x2="8" y2="21"/>
                <line x1="16" y1="18" x2="16" y2="21"/>
              </svg>
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Casas de banho</p>
              <p className="text-[15px] font-semibold text-gray-900">{house.bathrooms}</p>
            </div>
          </div>

        </div>
      </div>

      {/* Galeria */}
      <GaleriaCasa casa={house} />

      {/* Comodidades com ícones */}
      {house.amenities && house.amenities.length > 0 && (
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-6">O que esta casa oferece:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {house.amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3"
              >
                {AMENITY_ICONS[amenity] ? (
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                    <img
                      src={AMENITY_ICONS[amenity]}
                      alt={amenity}
                      className="w-5 h-5 object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                    <span
                      className="text-gray-400 text-base hidden items-center justify-center"
                      aria-hidden="true"
                    >✓</span>
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm text-gray-400">
                    ✓
                  </div>
                )}
                <span className="text-gray-700 text-sm font-medium leading-tight">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descrição */}
      {house.description && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Descrição</h2>
          <p className="leading-relaxed whitespace-pre-line text-gray-700">{house.description}</p>
        </div>
      )}

      {/* Reserva + Mapa */}
      <div id="reserveid" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        <div className="bg-white p-4 rounded-xl shadow-md border">
          <div className="font-bold text-xl mb-3">
            {hasDates
              ? `${totalFormatted} · ${nights} ${t("bookingdetails.nights")}`
              : `${nightFormatted} / ${t("favorites.night")}`}
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-2 divide-x">
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">{t("center.entrydate")}</label>
                <div
                  onClick={() => { setActiveField("start"); datepickerRef.current?.setOpen(true); }}
                  className="flex items-center justify-between cursor-pointer mt-1"
                >
                  <span className="text-sm">{checkIn ? parseLocalDate(checkIn).toLocaleDateString() : "dd/mm/yyyy"}</span>
                  <Calendar size={16} />
                </div>
              </div>
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">{t("center.outdate")}</label>
                <div
                  onClick={() => { setActiveField("end"); datepickerRef.current?.setOpen(true); }}
                  className="flex items-center justify-between cursor-pointer mt-1"
                >
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
        selected={activeField === "start" ? parseLocalDate(checkIn) : parseLocalDate(checkOut)}
        onChange={(date) => {
          if (!date) return;
          const formatted = formatLocalDate(date);
          if (activeField === "start") {
            setCheckIn(formatted);
            if (checkOut && formatted > checkOut) setCheckOut("");
          } else {
            if (!checkIn || formatted >= checkIn) setCheckOut(formatted);
          }
          datepickerRef.current?.setOpen(false);
        }}
        minDate={activeField === "end" && checkIn ? parseLocalDate(checkIn) : new Date()}
        withPortal
        className="hidden"
      />

      {hasReviews && <HouseReviews house={house} />}
    </div>
  );
};

export default HouseDetails;