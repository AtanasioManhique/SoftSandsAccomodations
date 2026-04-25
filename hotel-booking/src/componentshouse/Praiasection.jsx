// src/componentshouse/PraiaSection.jsx
import React, { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import leftarrow from "../assets/leftarrow.png";
import rightarrow from "../assets/right-arrow.png";
import HouseCard from "./HouseCard";

const ITEMS_PER_PAGE = 5;

// Props:
//   praia      — nome da praia (ex: "Ponta de Ouro")
//   houses     — casas já filtradas para esta praia
//   title      — (opcional) título grande acima do link (ex: "O Seu Refúgio de Praia")
//   subtitle   — (opcional) texto do link em vez do nome da praia (ex: "Praia da Ponta de Ouro")
//   isFirst    — (opcional) aplica mt-20 na primeira secção (espaço para a navbar)

const PraiaSection = ({ praia, houses, title, subtitle, isFirst = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const swiperRef = useRef(null);

  if (houses.length === 0) return null;

  const totalPages = Math.ceil(houses.length / ITEMS_PER_PAGE);
  const next = () => setCurrentIndex((prev) => (prev + 1) % totalPages);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  const visible = houses.slice(
    currentIndex * ITEMS_PER_PAGE,
    currentIndex * ITEMS_PER_PAGE + ITEMS_PER_PAGE
  );

  return (
   
    <div className={`flex flex-col items-start px-4 md:px-20 ${isFirst ? "mt-19 -pt-5" : "mt-10 pt-0"} relative`}>

      {/* Título grande — só aparece se for passado */}
      {title && (
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
      )}

      {/* Link da praia */}
      <div className="flex items-center justify-between mb-4 w-full">
        <Link
          to={`/praias/${encodeURIComponent(praia)}`}
          className="flex items-center gap-2 text-lg md:text-xl font-semibold text-gray-800 hover:underline"
        >
          {subtitle || praia}
          <ChevronRight className="w-5 h-5" />
        </Link>
      </div>

      {/* MOBILE — Swiper */}
      <div className="w-full md:hidden relative">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1}
          className="!pb-7 !px-1"
          loop={houses.length > 1}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
        >
          {houses.map((house) => (
            <SwiperSlide key={house.id}>
              <HouseCard house={house} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* DESKTOP — grid paginada */}
      <div className="hidden md:block relative w-full">
        {totalPages > 1 && (
          <button
            onClick={prev}
            className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
          >
            <img src={leftarrow} className="w-5 h-5" alt="Anterior" />
          </button>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {visible.map((house) => (
            <HouseCard key={house.id} house={house} />
          ))}
        </div>

        {totalPages > 1 && (
          <button
            onClick={next}
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10"
          >
            <img src={rightarrow} className="w-5 h-5" alt="Próximo" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PraiaSection;