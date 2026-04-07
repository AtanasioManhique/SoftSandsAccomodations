// src/pages/HouseDetails.jsx
import { useEffect, useState, useRef, useMemo } from "react";
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

// ── Normalização da casa do backend ─────────────────────────
const normalizeHouse = (raw) => {
  if (!raw) return null;

  // Backend retorna images: [{ url, isPrimary, ... }]
  // Frontend espera image: ["url1", "url2"]
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

const HouseDetails = () => {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { t }        = useTranslation();
  const { user }     = useAuth();
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
        // Backend retorna { data: { accommodation: {...} } }
        const raw = res.data?.data?.accommodation ?? res.data?.data ?? res.data;
        const normalized = normalizeHouse(raw);
        if (mounted) setHouse(normalized);
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
    <div className="py-28 px-4 text-center text-gray-500">
      Casa não encontrada.
    </div>
  );

  const maxGuests = house.maxGuests || 1;
  const lat = Number(house.latitude);
  const lng = Number(house.longitude);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  // Preço por noite na moeda do utilizador
  const nightPriceConverted = convertPrice(house.pricePerNight, "ZAR", currency, rates);
  const nightFormatted = formatCurrency(nightPriceConverted, currency);

  // Total
  const nights = calcNights(checkIn, checkOut);
  const totalZAR = nights * (house.pricePerNight ?? 0);
  const totalConverted = convertPrice(totalZAR, "ZAR", currency, rates);
  const totalFormatted = formatCurrency(totalConverted, currency);
  const hasDates = Boolean(checkIn && checkOut && nights > 0);

  const handleReserve = async () => {
    if (!user) { openLogin(); return; }
    if (!checkIn || !checkOut) { alert("Por favor selecione datas antes de reservar."); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { alert("A data de saída deve ser depois da data de entrada."); return; }
    if (guests > maxGuests) { alert(`Esta casa suporta no máximo ${maxGuests} hóspedes.`); return; }

    try {
      const payload = {
        accommodationId: house.id,
        checkInDate:     checkIn,
        checkOutDate:    checkOut,
        guests,
      };
      const res = await api.post("/bookings", payload);
      const booking = res.data?.data?.booking ?? res.data?.data ?? res.data;
      const bookingId = booking?.id;

      const state = {
        ...booking,
        id:              bookingId,
        accommodationId: house.id,
        houseName:       house.name,
        images:          house.image,
        startDate:       checkIn,
        endDate:         checkOut,
        guests,
        totalPrice:      booking?.totalPrice ?? totalZAR,
        currency:        booking?.currency ?? "ZAR",
        status:          booking?.status ?? "pending_payment",
      };

      navigate(`/pagamento/${bookingId}`, { state });
    } catch (err) {
      console.error("Erro ao criar reserva:", err.response?.data ?? err);
      const msg = err.response?.data?.error?.message ?? "Erro ao criar reserva. Tenta novamente.";
      alert(msg);
    }
  };

  const hasReviews = house.reviews && Array.isArray(house.reviews) && house.reviews.length > 0;

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 space-y-10">

      {/* Nome + localização */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{house.name}</h1>
        <div className="flex items-center gap-1 text-gray-600">
          <img src={locationicon} className="w-4 h-4" alt="location" />
          <span>{house.location}{house.beachName ? ` · ${house.beachName}` : ""}</span>
        </div>
      </div>

      {/* Galeria */}
      <GaleriaCasa casa={house} />

      {/* Specs */}
      <div className="flex flex-wrap gap-6 text-gray-700 border-b pb-6">
        <div><strong>{house.maxGuests}</strong> hóspedes</div>
        <div><strong>{house.bedrooms}</strong> quarto{house.bedrooms !== 1 ? "s" : ""}</div>
        <div><strong>{house.bathrooms}</strong> casa{house.bathrooms !== 1 ? "s" : ""} de banho</div>
      </div>

      {/* Comodidades */}
      {house.amenities && house.amenities.length > 0 && (
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-6">O que esta casa oferece:</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {house.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-gray-700 text-sm sm:text-base">✓ {amenity}</span>
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

        {/* Formulário de reserva */}
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
                <div onClick={() => { setActiveField("start"); datepickerRef.current?.setOpen(true); }} className="flex items-center justify-between cursor-pointer mt-1">
                  <span className="text-sm">{checkIn ? parseLocalDate(checkIn).toLocaleDateString() : "dd/mm/yyyy"}</span>
                  <Calendar size={16} />
                </div>
              </div>
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">{t("center.outdate")}</label>
                <div onClick={() => { setActiveField("end"); datepickerRef.current?.setOpen(true); }} className="flex items-center justify-between cursor-pointer mt-1">
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
        selected={activeField === "start" ? parseLocalDate(checkIn) : parseLocalDate(checkOut)}
        onChange={(date) => {
          if (!date) return;
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
        minDate={activeField === "end" && checkIn ? parseLocalDate(checkIn) : new Date()}
        withPortal
        className="hidden"
      />

      {hasReviews && <HouseReviews house={house} />}
    </div>
  );
};

export default HouseDetails;