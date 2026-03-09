import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import rightarrow from "../assets/right-arrow.png";
import leftarrow from "../assets/leftarrow.png";
import { ChevronRight } from "lucide-react";
import HouseCard, { HouseCardSkeleton } from "./HouseCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { useTranslation } from "react-i18next";

// ── Skeleton da Pontahouses ───────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const PontahousesSkeleton = () => (
  <div className="flex flex-col items-start px-4 md:px-20 pt-8 mt-20 relative">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

    {/* Título skeleton */}
    <div style={{ ...shimmerStyle, width: "260px", height: "32px", borderRadius: "8px", marginBottom: "12px" }} />
    <div style={{ ...shimmerStyle, width: "180px", height: "22px", borderRadius: "6px", marginBottom: "24px" }} />

    {/* Grid skeleton — desktop */}
    <div className="hidden md:grid grid-cols-5 gap-6 w-full">
      {[...Array(5)].map((_, i) => (
        <HouseCardSkeleton key={i} />
      ))}
    </div>

    {/* Card skeleton — mobile */}
    <div className="md:hidden w-full">
      <HouseCardSkeleton />
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────

const Pontahouses = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);
  const { t } = useTranslation();
  const itemsPerPage = 5;

  useEffect(() => {
    api
      .get("/data/casas.json", { baseURL: window.location.origin })
      .then((res) => {
        const data = res.data;
        const ponta = data.filter((house) => house.location === "Ponta de Ouro");
        setHouses(ponta);
      })
      .catch((err) => console.error("Erro ao carregar casas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PontahousesSkeleton />;

  const totalPages = Math.ceil(houses.length / itemsPerPage);
  const next = () => setCurrentIndex((prev) => (prev + 1) % totalPages);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  const startIndex = currentIndex * itemsPerPage;
  const visibleDestinos = houses.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="flex flex-col items-start px-4 md:px-20 pt-8 mt-20 relative">

      <h2 className="text-3xl md:text-3xl font-bold text-gray-900 mb-4">
        {t("pontaouro.title")}
      </h2>

      <div className="flex items-center justify-between mb-4 w-full">
        <Link
          to={`/praias/${encodeURIComponent("Ponta de Ouro")}`}
          className="flex items-center gap-2 text-lg md:text-xl font-semibold text-gray-800 hover:underline"
        >
          {t("pontaouro.subtitle")}
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      {/* MOBILE (Swiper) */}
      <div className="w-full md:hidden relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1}
          className="!pb-7 !px-2"
          loop={true}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {houses.map((house) => (
            <SwiperSlide key={house.id}>
              <HouseCard house={house} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP */}
      <div className="hidden md:block relative w-full">
        <button
          onClick={prev}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <img src={leftarrow} className="w-5 h-5" alt="Anterior" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {visibleDestinos.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>

        <button
          onClick={next}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <img src={rightarrow} className="w-5 h-5" alt="Próximo" />
        </button>
      </div>
    </div>
  );
};

export default Pontahouses;