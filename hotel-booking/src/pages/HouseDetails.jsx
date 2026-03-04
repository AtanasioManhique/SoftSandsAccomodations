import { useEffect, useState, useRef } from "react";
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

// ── Google Maps Embed ─────────────────────────────────────────
// Gratuito, sem API key, sem conta Google necessária.
// Mostra mapa real com ruas, zoom e satélite via iframe.
// MIGRAÇÃO FUTURA → Google Maps API completa (Street View, rotas):
//   1. npm install @react-google-maps/api
//   2. Substituir o iframe por <GoogleMap>
//   3. Criar .env: VITE_GOOGLE_MAPS_KEY=AIzaSy...
// ─────────────────────────────────────────────────────────────

const MapEmbed = ({ lat, lng, locationName }) => {
  const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
  const googleMapsDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  return (
    <div style={{
      height: "300px",
      borderRadius: "16px",
      overflow: "hidden",
      boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
      border: "1px solid #e5e7eb",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Mapa real via iframe — gratuito, sem API key */}
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

      {/* Rodapé com dois botões */}
      <div style={{
        display: "flex",
        gap: "10px",
        padding: "12px 16px",
        background: "#fff",
        borderTop: "1px solid #f0f0f0",
      }}>
        {/* Ver no Google Maps */}
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
          onMouseEnter={(e) => e.currentTarget.style.background = "#2d2d4e"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#1a1a2e"}
        >
          <ExternalLink size={14} />
          Ver no Google Maps
        </a>

        {/* Como chegar */}
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
          onMouseEnter={(e) => e.currentTarget.style.background = "#f5f5f5"}
          onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
        >
          🗺️ Como chegar
        </a>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────

const HouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getTotalPrice, getNightPrice } = useSeasonPricing();
  const { user } = useAuth();
  const { openLogin } = useLoginModal();

  const [house, setHouse] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(1);
  const [activeField, setActiveField] = useState(null);
  const datepickerRef = useRef(null);

  // ── BACKEND: substituir por fetch(`/api/houses/${id}`) ─────
  useEffect(() => {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((data) => {
        const casasArray = Array.isArray(data) ? data : data.casas;
        if (!Array.isArray(casasArray)) {
          console.error("Formato inválido no casas.json");
          return;
        }
        const selectedHouse = casasArray.find((h) => h.id === Number(id));
        if (selectedHouse) {
          setHouse(selectedHouse);
          setMaxGuests(selectedHouse.capacity || 1);
        }
      })
      .catch((err) => console.error("Erro ao carregar casa:", err));
  }, [id]);

  if (!house) return null;

  const lat = Number(house.coordinates?.lat);
  const lng = Number(house.coordinates?.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  const { formatted: nightFormatted } = getNightPrice(house.price, new Date());
  const hasDates = checkIn && checkOut;
  const totalData = hasDates ? getTotalPrice(house.price, checkIn, checkOut) : null;

  const handleReserve = () => {
    if (!user) { openLogin(); return; }
    if (!checkIn || !checkOut) { alert("Por favor selecione datas antes de reservar."); return; }
    if (new Date(checkOut) <= new Date(checkIn)) { alert("A data de saída deve ser depois da data de entrada."); return; }
    if (guests > maxGuests) { alert(`Esta casa suporta no máximo ${maxGuests} hóspedes.`); return; }

    const reserva = {
      id: Date.now(),
      houseId: house.id,
      houseName: house.location,
      images: house.image,
      startDate: checkIn,
      endDate: checkOut,
      guests,
      totalPrice: totalData?.formatted,
      status: "pendente",
    };
    navigate(`/pagamento/${reserva.id}`, { state: reserva });
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
                <img src={amenity.icon} alt={amenity.name} className="w-6 h-6 object-contain" />
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

      {/* Grid: Reserva (esq) + Mapa (dir) */}
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
                  onClick={() => { setActiveField("start"); datepickerRef.current.setOpen(true); }}
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
                  onClick={() => { setActiveField("end"); datepickerRef.current.setOpen(true); }}
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
                    {i + 1} {t("center.guests")}{i + 1 > 1 ? "s" : ""}
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

        {/* Mapa Google Maps Embed ou fallback sem coordenadas */}
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
            ? checkIn ? new Date(checkIn) : null
            : checkOut ? new Date(checkOut) : null
        }
        onChange={(date) => {
          if (activeField === "start") {
            const formatted = date.toISOString().split("T")[0];
            setCheckIn(formatted);
            if (checkOut && new Date(formatted) > new Date(checkOut)) setCheckOut("");
          } else {
            if (!checkIn || date >= new Date(checkIn)) {
              setCheckOut(date.toLocaleDateString("en-CA"));
            }
          }
          datepickerRef.current.setOpen(false);
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