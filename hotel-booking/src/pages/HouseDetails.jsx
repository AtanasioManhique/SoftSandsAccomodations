import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import locationicon from "../assets/location.png";
import fullstar from "../assets/fullstar.png";
import GaleriaCasa from "./GaleriaCasa";
import HouseReviews from "./HouseReviews";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import {useTranslation} from "react-i18next"
const HouseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const {t}= useTranslation();
  const [house, setHouse] = useState(null);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [maxGuests, setMaxGuests] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyCwOPuzi7GB8-TPIyM4XzzIeg_T_deOpPw",
  });

  // 🔹 Carregar casa pelo ID
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

  // 🔹 SCROLL DINÂMICO
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const elementId = hash.replace("#", "");

    const scrollToElement = () => {
      const navbar = document.getElementById("navbar");
      const el = document.getElementById(elementId);

      if (!el) return;

      const navHeight = navbar ? navbar.offsetHeight : 0;

      const y =
        el.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;

      window.scrollTo({ top: y, behavior: "smooth" });
    };

    setTimeout(scrollToElement, 100);
    setTimeout(scrollToElement, 300);
  }, []);

  // 🔹 Calcular preço
  const calcularPreco = () => {
    if (!checkIn || !checkOut || !house) return 0;

    const start = new Date(checkIn);
    const end = new Date(checkOut);

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    if (days <= 0) return 0;

    let precoDia = house.price.low_season;
    if (start.getMonth() >= 9 || end.getMonth() >= 9) {
      precoDia = house.price.high_season;
    }

    return days * precoDia;
  };

  useEffect(() => {
    if (house) setTotalPrice(calcularPreco());
  }, [checkIn, checkOut, guests, house]);

  // 🔹 RESERVA → vai para MINHAS RESERVAS com estado PENDENTE
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
      id: Date.now(), // id único
      houseId: house.id,
      houseName: house.location,
      images: house.image,
      checkin: checkIn,
      checkout: checkOut,
      guests,
      price: totalPrice,
      currency: house.price.currency,
      status: "pendente",
    };

    // 🔥 Salvar no localStorage
    const stored = JSON.parse(localStorage.getItem("reservas")) || [];
    stored.push(reserva);
    localStorage.setItem("reservas", JSON.stringify(stored));

    // 🔥 FUTURO BACKEND:
    /*
    fetch("/api/reservas", {
      method: "POST",
      body: JSON.stringify(reserva),
      headers: { "Content-Type": "application/json" }
    });
    */

    // 👉 Vai para página de pagamento
    navigate(`/pagamento/${reserva.id}`, { state: reserva });
  };

  if (!house) return null;

  return (
    <div className="py-28 px-4 md:px-16 lg:px-24 xl:px-32 space-y-10">

      {/* Informações iniciais */}
        <div className="flex flex-wrap items-center gap-2 text-gray-700 text-lg">

  {/* Rating + Estrela */}
  <div className="flex items-center gap-1">
    <span>{house.rating}</span>
    <img src={fullstar} className="w-5 h-5" />
  </div>

  {/* Hífen */}
  <span className="text-gray-400">•</span>

  {/* Localização */}
  <div className="flex items-center gap-1">
    <img src={locationicon} className="w-4 h-4" />
    <span>{house.location}</span>
  </div>

  {/* Hífen */}
  <span className="text-gray-400">•</span>

  {/* Link Mostrar Mapa */}
  <button
    onClick={() => {
      const el = document.getElementById("reserveid");
      if (!el) return;
      const nav = document.getElementById("navbar");
      const navHeight = nav ? nav.offsetHeight : 0;
      const y = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 10;
      window.scrollTo({ top: y, behavior: "smooth" });
    }}
    className="text-blue-600 underline cursor-pointer"
  >
   {t("center.map")}
  </button>

</div>

      {/* Galeria */}
      <GaleriaCasa casa={house} />

      {/* Descrição */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Descrição</h2>
        <p className="leading-relaxed whitespace-pre-line">
          {house.description}
        </p>
      </div>

      {/* Painel de Reserva */}
      <div id="reserveid" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md border">
          <div className="font-bold text-xl mb-3">
            {totalPrice} {house.price.currency}
          </div>

          <div className="border rounded-lg overflow-hidden mb-4">
            {/* Datas */}
            <div className="grid grid-cols-2 divide-x">
              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">
                {t("center.entrydate")}
                </label>
                <input
                  type="date"
                  className="w-full"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                />
              </div>

              <div className="p-2">
                <label className="text-xs font-semibold uppercase text-gray-600">
                  {t("center.outdate")}
                </label>
                <input
                  type="date"
                  className="w-full"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                />
              </div>
            </div>

            {/* Hóspedes */}
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
                    {i + 1} {t("center.guests")} {i + 1 > 1 ? "s" : ""}
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

        {/* Mapa */}
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
            <p className="text-center mt-10 text-gray-500">{t("center.loading")}</p>
          )}
        </div>
      </div>

      <HouseReviews house={house} />
    </div>
  );
};

export default HouseDetails;
