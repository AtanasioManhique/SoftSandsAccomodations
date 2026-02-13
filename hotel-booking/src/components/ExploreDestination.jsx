import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import Title from "./Title";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import rightarrow from "../assets/right-arrow.png";
import leftarrow from "../assets/leftarrow.png";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import {useTranslation} from "react-i18next";

const ExploreDestination = () => {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const {t} = useTranslation();

  useEffect(() => {
    api
      .get("/data/casas.json", { baseURL: window.location.origin })
      .then((res) => {
        const data = res.data;

        // Agrupa por location
        const grouped = data.reduce((acc, house) => {
          if (!acc[house.location]) acc[house.location] = [];
          acc[house.location].push(house);
          return acc;
        }, {});

        // Transforma em array de destinos únicos
        const uniqueDestinos = Object.keys(grouped).map((location) => ({
          name: location,
          image: grouped[location][0].image[0], // usa a imagem da primeira casa como thumbnail
          totalCasas: grouped[location].length
        }));

        setDestinos(uniqueDestinos);
      })
      .catch((err) => console.error("Erro ao carregar destinos:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">{t("explore.loading")}</p>
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
  <div className="flex flex-col items-center pt-3 py-8 pb-15">
    
    <div className="w-full max-w-7xl">
      {/* Título alinhado com os cards */}
      <div className="">
        <Title align="left" title={t("explore.destination")} />
      </div>

      <div className="relative mt-6">
        {/* Botão Esquerdo */}
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
        >
          <img src={leftarrow} className="w-5 h-5" alt="Anterior" />
        </button>

        {/* Swiper com autoplay e setas */}
        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={20}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 1.2, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
            480: { slidesPerView: 1.5, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
            640: { slidesPerView: 2, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
            768: { slidesPerView: 3, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
            1024: { slidesPerView: 3.5, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
            1280: { slidesPerView: 4, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
          }}
        >
          {destinos.map((destino, index) => (
            <SwiperSlide key={index}>
              <Link
                to={`/praias/${encodeURIComponent(destino.name)}`}
                className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md group block"
              >
                <img
                  src={destino.image}
                  alt={destino.name}
                  className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-center py-3 text-lg font-semibold">
                  {destino.name} ({destino.totalCasas})
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Botão Direito */}
        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
        >
          <img src={rightarrow} className="w-5 h-5" alt="Próximo" />
        </button>
      </div>
    </div>
  </div>
);

};

export default ExploreDestination;
