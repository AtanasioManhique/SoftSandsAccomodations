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

const MapEmbed = ({ lat, lng, locationName }) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div
      style={{
        height: "300px",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
        border: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ flex: 1, position: "relative" }}>
        <iframe
          title={`Mapa - ${locationName}`}
          width="100%"
          height="100%"
          style={{ border: 0, display: "block" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "12px 16px",
          background: "#fff",
          borderTop: "1px solid #f0f0f0",
        }}
      >
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            background: "#1a1a2e",
            color: "white",
            borderRadius: "10px",
            padding: "10px 0",
            fontSize: "13px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#2d2d4e")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#1a1a2e")}
        >
          <ExternalLink size={14} />
          Ver no Google Maps
        </a>

        <a
          href={googleMapsDirectionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            background: "#fff",
            color: "#1a1a2e",
            border: "1.5px solid #1a1a2e",
            borderRadius: "10px",
            padding: "10px 0",
            fontSize: "13px",
            fontWeight: "600",
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#f5f5f5")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "#fff")}
        >
          🗺️ Como chegar
        </a>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────

const normalizeAccommodation = (raw) => {
  // tenta suportar Mongo (_id) ou SQL (id)
  const id = raw?.id ?? raw?._id;

  // tenta suportar nomes alternativos
  const capacity = raw?.capacity ?? raw?.maxGuests ?? 1;

  // rating / location / images / etc - mantém se existir
  return {
    ...raw,
    id,
    capacity,
  };
};

const extractData = (resData) => {
  // suporta padrões: {data: ...} ou {success, data} ou direto
  if (!resData) return null;
  return resData.data ?? resData;
};

const HouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getTotalPrice, getNightPrice } = useSeasonPricing();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();

  const [house, setHouse] = useState(null);
  const [loadingHouse, setLoadingHouse] = useState(false);

  // mantendo como string YYYY-MM-DD (compatível com teu pricing atual)
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [guests, setGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(1);

  const [activeField, setActiveField] = useState(null);
  const datepickerRef = useRef(null);

  // ── LOAD HOUSE: backend -> fallback json ───────────────────
  useEffect(() => {
    let mounted = true;

    const loadFromBackend = async () => {
      setLoadingHouse(true);
      try {
        const res = await api.get(`/accommodations/${id}`);
        const payload = extractData(res.data);
        const normalized = normalizeAccommodation(payload);

        if (!mounted) return;
        setHouse(normalized);
        setMaxGuests(normalized.capacity || 1);
      } catch (err) {
        console.error("Erro ao carregar accommodation no backend:", err);

        // fallback
        try {
          const r = await fetch("/data/casas.json");
          const data = await r.json();
          const casasArray = Array.isArray(data) ? data : data.casas;

          if (!Array.isArray(casasArray)) {
            console.error("Formato inválido no casas.json");
            return;
          }

          const selectedHouse = casasArray.find((h) => h.id === Number(id));
          if (selectedHouse && mounted) {
            setHouse(normalizeAccommodation(selectedHouse));
            setMaxGuests(selectedHouse.capacity || 1);
          }
        } catch (e) {
          console.error("Erro fallback casas.json:", e);
        }
      } finally {
        if (mounted) setLoadingHouse(false);
      }
    };

    loadFromBackend();

    return () => {
      mounted = false;
    };
  }, [id]);

  const houseId = useMemo(() => house?.id ?? house?._id, [house]);

  if (loadingHouse && !house) return null; // ou loader
  if (!house) return null;

  const lat = Number(house.coordinates?.lat);
  const lng = Number(house.coordinates?.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  const { formatted: nightFormatted } = getNightPrice(house.price, new Date());
  const hasDates = Boolean(checkIn && checkOut);
  const totalData = hasDates ? getTotalPrice(house.price, checkIn, checkOut) : null;

  // ── CREATE BOOKING (backend) ───────────────────────────────
  const handleReserve = async () => {
    if (!user) {
      openLogin();
      return;
    }

    if (!checkIn || !checkOut) {
      alert("Por favor selecione datas antes de reservar.");
      return;
    }

    if (new Date(checkOut) <= new Date(checkIn)) {
      alert("A data de saída deve ser depois da data de entrada.");
      return;
    }

    if (guests > maxGuests) {
      alert(`Esta casa suporta no máximo ${maxGuests} hóspedes.`);
      return;
    }

    if (!houseId) {
      alert("Erro: accommodationId inválido.");
      return;
    }

    try {
      // backend: /api/bookings
      // payload típico
      const payload = {
        accommodationId: houseId, // <- conforme tua API/tabela
        startDate: checkIn,       // "YYYY-MM-DD"
        endDate: checkOut,        // "YYYY-MM-DD"
        guests,
      };

      const res = await api.post("/bookings", payload);
      const booking = extractData(res.data);

      const bookingId = booking?.id ?? booking?._id ?? booking?.bookingId;

      // Envia tudo que o pagamento pode precisar no state
      const state = {
        ...booking,
        id: bookingId,
        accommodationId: houseId,
        houseName: house.location,
        images: house.image,
        startDate: checkIn,
        endDate: checkOut,
        guests,
        // se backend não mandar total, usa o teu cálculo
        totalPrice: booking?.totalPrice ?? totalData?.formatted,
        status: booking?.status ?? "pendente",
      };

      if (!bookingId) {
        // não bloqueia, mas avisa
        console.warn("Booking criado mas sem id explícito no response:", booking);
      }

      navigate(`/pagamento/${bookingId || "pendente"}`, { state });
    } catch (err) {
      console.error("Erro ao criar booking:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Falha ao criar reserva.";

      alert(msg);
    }
  };

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
                <img
                  src={amenity.icon}
                  alt={amenity.name}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-gray-700 text-sm sm:text-base">{amenity.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descrição */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Descrição</h2>
        <p className="leading-relaxed whitespace-pre-line">{house.description}</p>
      </div>

      {/* Grid: Reserva + Mapa */}
      <div id="reserveid" className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
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
                <label className="text-xs font-semibold uppercase text-gray-600">
                  {t("center.entrydate")}
                </label>
                <div
                  onClick={() => {
                    setActiveField("start");
                    datepickerRef.current?.setOpen(true);
                  }}
                  className="flex items-center justify-between cursor-pointer mt-1"
                >
                  <span className="text-sm">
                    {checkIn ? new Date(checkIn).toLocaleDateString() : "dd/mm/yyyy"}
                  </span>
                  <Calendar size={16} />
                </div>
              </div>

              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">
                  {t("center.outdate")}
                </label>
                <div
                  onClick={() => {
                    setActiveField("end");
                    datepickerRef.current?.setOpen(true);
                  }}
                  className="flex items-center justify-between cursor-pointer mt-1"
                >
                  <span className="text-sm">
                    {checkOut ? new Date(checkOut).toLocaleDateString() : "dd/mm/yyyy"}
                  </span>
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            <div className="p-2 border-t">
              <label className="text-xs font-semibold uppercase text-gray-600">
                {t("center.guests")}
              </label>
              <select
                className="w-full mt-1"
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
              >
                {[...Array(maxGuests)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1} {t("center.guests")}
                    {i + 1 > 1 ? "s" : ""}
                  </option>
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
          <div
            className="flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-200"
            style={{ height: "300px" }}
          >
            <div className="text-center px-6">
              <p className="text-gray-600 mb-2 font-medium">{t("location.avalaibilty")}</p>
              <p className="text-sm text-gray-500">
                {t("location.info")},{" "}
                <span
                  onClick={() => navigate("/contactenos")}
                  className="text-blue-600 underline cursor-pointer"
                >
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
            ? checkIn
              ? new Date(checkIn)
              : null
            : checkOut
            ? new Date(checkOut)
            : null
        }
        onChange={(date) => {
          if (!date) return;

          if (activeField === "start") {
            const formatted = date.toISOString().split("T")[0]; // YYYY-MM-DD
            setCheckIn(formatted);

            if (checkOut && new Date(formatted) > new Date(checkOut)) {
              setCheckOut("");
            }
          } else {
            if (!checkIn || date >= new Date(checkIn)) {
              setCheckOut(date.toLocaleDateString("en-CA")); // YYYY-MM-DD
            }
          }

          datepickerRef.current?.setOpen(false);
        }}
        minDate={activeField === "end" && checkIn ? new Date(checkIn) : new Date()}
        withPortal
        className="hidden"
      />

      {/* Reviews */}
      <HouseReviews house={house} />
    </div>
  );
};

export default HouseDetails;