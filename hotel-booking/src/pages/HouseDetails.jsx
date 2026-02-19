import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import locationicon from "../assets/location.png";
import fullstar from "../assets/fullstar.png";
import GaleriaCasa from "./GaleriaCasa";
import HouseReviews from "./HouseReviews";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useTranslation } from "react-i18next";
import { useSeasonPricing } from "../context/seasonPricing";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

const HouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { getTotalPrice, getNightPrice } = useSeasonPricing();

  const [house, setHouse] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(1);

  // ✅ NOVO (datepicker)
  const [activeField, setActiveField] = useState(null);
  const datepickerRef = useRef(null);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "SUA_API_KEY_AQUI",
  });

  useEffect(() => {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((data) => {
        const selectedHouse = data.find((h) => h.id === Number(id));
        if (selectedHouse) {
          setHouse(selectedHouse);
          setMaxGuests(selectedHouse.capacity || 1);
        }
      });
  }, [id]);

  if (!house) return null;

  const { formatted: nightFormatted } = getNightPrice(
    house.price,
    new Date()
  );

  const hasDates = checkIn && checkOut;

  const totalData = hasDates
    ? getTotalPrice(house.price, checkIn, checkOut)
    : null;

  const handleReserve = () => {
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

    const stored = JSON.parse(localStorage.getItem("reservas")) || [];
    stored.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(stored));

    navigate(`/pagamento/${reserva.id}`, { state: reserva });
  };

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 space-y-10">
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

      <GaleriaCasa casa={house} />

      {/* Amenities */}
      {house.amenities && house.amenities.length > 0 && (
        <div className="border-b pb-8">
          <h2 className="text-xl font-semibold mb-6">
            O que esta casa oferece:
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {house.amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-3">
                <img
                  src={amenity.icon}
                  alt={amenity.name}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-gray-700 text-sm sm:text-base">
                  {amenity.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Descrição */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Descrição</h2>
        <p className="leading-relaxed whitespace-pre-line">
          {house.description}
        </p>
      </div>

      {/* Reserva */}
      <div id="reserveid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md border">

          <div className="font-bold text-xl mb-3">
            {hasDates
              ? `${totalData.formatted} · ${totalData.nights} ${t("bookingdetails.nights")}`
              : `${nightFormatted} / ${t("favorites.night")}`}
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            <div className="grid grid-cols-2 divide-x">
              
              {/* Entrada */}
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">
                  {t("center.entrydate")}
                </label>
                <div
                  onClick={() => {
                    setActiveField("start");
                    datepickerRef.current.setOpen(true);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>
                    {checkIn
                      ? new Date(checkIn).toLocaleDateString()
                      : "dd/mm/yyyy"}
                  </span>
                  <Calendar size={16} />
                </div>
              </div>

              {/* Saída */}
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">
                  {t("center.outdate")}
                </label>
                <div
                  onClick={() => {
                    setActiveField("end");
                    datepickerRef.current.setOpen(true);
                  }}
                  className="flex items-center justify-between cursor-pointer"
                >
                  <span>
                    {checkOut
                      ? new Date(checkOut).toLocaleDateString()
                      : "dd/mm/yyyy"}
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
                className="w-full"
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
            className="w-full bg-gray-800 text-white py-3 rounded-lg font-semibold"
          >
            {t("center.reserve")}
          </button>
        </div>

        <div className="h-64 rounded-lg overflow-hidden shadow-md">
          {isLoaded ? (
            <GoogleMap
              zoom={15}
              center={{ lat: house.lat, lng: house.lng }}
              mapContainerStyle={{ width: "100%", height: "100%" }}
            >
              <Marker position={{ lat: house.lat, lng: house.lng }} />
            </GoogleMap>
          ) : (
            <p className="text-center mt-10 text-gray-500">
              {t("center.loading")}
            </p>
          )}
        </div>
      </div>

      {/* DatePicker */}
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
          if (activeField === "start") {
            const formatted = date.toISOString().split("T")[0];
            setCheckIn(formatted);

            if (checkOut && new Date(formatted) > new Date(checkOut)) {
              setCheckOut("");
            }
          } else {
            if (!checkIn || date >= new Date(checkIn)) {
              const formatted = date.toLocaleDateString("en-CA");
              setCheckOut(formatted);
            }
          }

          datepickerRef.current.setOpen(false);
        }}
        minDate={
          activeField === "end" && checkIn
            ? new Date(checkIn)
            : new Date()
        }
        withPortal
        className="hidden"
      />

      <HouseReviews house={house} />
    </div>
  );
};

export default HouseDetails;
