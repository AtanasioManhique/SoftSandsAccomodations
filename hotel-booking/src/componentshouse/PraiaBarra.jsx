import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import rightarrow from "../assets/right-arrow.png";
import leftarrow from "../assets/leftarrow.png";
import { ChevronRight } from "lucide-react";
import HouseCard from "./HouseCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import {useTranslation} from "react-i18next"

const PraiaBarra = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);
  const {t} = useTranslation();
    const itemsPerPage = 5;

  useEffect(() => {
    api
      .get("/data/casas.json", { baseURL: window.location.origin })
      .then((res) => {
        const data = res.data;
        const barra = data.filter(
          (house) => house.location === "Praia da Barra"
        );
        setHouses(barra);
      })
      .catch((err) => console.error("Erro ao carregar casas:", err))
      .finally(() => setLoading(false));
  }, []);

  const totalPages = Math.ceil(houses.length / itemsPerPage);
  const next = () => setCurrentIndex((prev) => (prev + 1) % totalPages);
  const prev = () =>
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);

  const startIndex = currentIndex * itemsPerPage;
  const visibleDestinos = houses.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500">
        {t("pontaouro.loading")}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start px-4 md:px-20 pt-5 mt-2 relative">
      {/* TÍTULO */}
      <div className="flex items-center justify-between mb-4 w-full">
           <Link
                           to={`/praias/${encodeURIComponent("Praia da Barra")}`}
                           className="flex items-center gap-2 text-lg md:text-xl font-semibold text-gray-800 hover:underline"
                         >
                           {t("barra")}
                           <ChevronRight className="w-5 h-5" />
                         </Link>
      </div>

      {/* MOBILE */}
      <div className="w-full md:hidden relative">
        <button
          onClick={() => swiperRef.current?.slidePrev()}
          className="absolute left-[-10px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <img src={leftarrow} className="w-5 h-5" alt="Anterior" />
        </button>

        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={20}
          slidesPerView={1.1}
          loop={true}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {houses.map((house) => (
            <SwiperSlide key={house.id}>
              <HouseCard house={house} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          onClick={() => swiperRef.current?.slideNext()}
          className="absolute right-[-10px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
        >
          <img src={rightarrow} className="w-5 h-5" alt="Próximo" />
        </button>
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

export default PraiaBarra;
