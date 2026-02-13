import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import BeachCard from "./BeachCard";
import Title from "./Title";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import rightarrow from "../assets/right-arrow.png";
import leftarrow from "../assets/leftarrow.png";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import Pontahouses from "../componentshouse/PontadeOuro";
import {useTranslation} from "react-i18next";

const FeaturedDestination = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const {t} = useTranslation();

  useEffect(() => {
    api
      .get("/data/casas.json", { baseURL: window.location.origin })
      .then((res) => {
        const data = res.data;
        const housesPerLocation = 2; // 👈 número de casas que queres por destino

        // Agrupa casas por localização
        const grouped = data.reduce((acc, house) => {
          if (!acc[house.location]) acc[house.location] = [];
          acc[house.location].push(house);
          return acc;
        }, {});

        // Pega apenas as primeiras casasPerLocation de cada grupo
        const groupedHouses = [];
        Object.values(grouped).forEach((group) => {
          groupedHouses.push(...group.slice(0, housesPerLocation));
        });

        setHouses(groupedHouses);
      })
      .catch((err) => console.error("Erro ao buscar casas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">{t("featured.loading")}</p>
      </div>
    );
  }

  const handleNext = () => {
    if (swiperRef.current) swiperRef.current.slideNext();
  };

  const handlePrev = () => {
    if (swiperRef.current) swiperRef.current.slidePrev();
  };

  return (
      <div className="flex flex-col items-center bg-slate-50 py-20 pb-15">

      
        <p className="px-6 md:px-16 lg:px-24 text-xl md:text-xl text-gray-600/90 -mt-8 max-2-174">{t("featured.title")}</p>
    

      <div className="relative w-full max-w-7xl mt-10">
        {/* Botão Esquerdo */}
        <button
          onClick={handlePrev}
          className="absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
        >
          <img src={leftarrow} className="w-5 h-5" alt="Anterior" />
        </button>

        {/* Swiper com autoplay + navegação manual */}
        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={20}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 1.1 },
            480: { slidesPerView: 1.5 },
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 3.5 },
            1280: { slidesPerView: 4 },
          }}
        >
          {houses.map((house) => (
            <SwiperSlide key={house.id}>
              <BeachCard house={house} />
          
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Botão Direito */}
        <button
          onClick={handleNext}
          className="absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
        >
          <img src={rightarrow} className="w-5 h-5" alt="Próximo" />
        </button>
      </div>
    </div>
  );
};

export default FeaturedDestination;
