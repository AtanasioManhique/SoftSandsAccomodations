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
import { useTranslation } from "react-i18next";

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const BeachCardSkeleton = () => (
  <div style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid #f0f0f0", background: "#fff" }}>
    {/* Imagem */}
    <div style={{ ...shimmerStyle, width: "100%", height: "192px" }} />
    <div style={{ padding: "10px 12px", display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Localização */}
      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
        <div style={{ ...shimmerStyle, width: "16px", height: "16px", borderRadius: "50%" }} />
        <div style={{ ...shimmerStyle, width: "100px", height: "14px", borderRadius: "4px" }} />
      </div>
      {/* Preço e rating */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ ...shimmerStyle, width: "90px", height: "14px", borderRadius: "4px" }} />
        <div style={{ ...shimmerStyle, width: "40px", height: "14px", borderRadius: "4px" }} />
      </div>
    </div>
    {/* Botão */}
    <div style={{ ...shimmerStyle, margin: "0 12px 12px", height: "36px", borderRadius: "8px" }} />
  </div>
);

const FeaturedDestinationSkeleton = () => (
  <div className="flex flex-col items-center bg-slate-50 py-16 pb-10">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    {/* Subtítulo skeleton */}
    <div style={{ ...shimmerStyle, width: "320px", height: "20px", borderRadius: "6px", marginBottom: "40px" }} />
    {/* Cards skeleton */}
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-4">
        {[...Array(4)].map((_, i) => (
          <BeachCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────

const FeaturedDestination = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const swiperRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    api
      .get("/data/casas.json", { baseURL: window.location.origin })
      .then((res) => {
        const data = res.data;
        const housesPerLocation = 2;

        const grouped = data.reduce((acc, house) => {
          if (!acc[house.location]) acc[house.location] = [];
          acc[house.location].push(house);
          return acc;
        }, {});

        const groupedHouses = [];
        Object.values(grouped).forEach((group) => {
          groupedHouses.push(...group.slice(0, housesPerLocation));
        });

        setHouses(groupedHouses);
      })
      .catch((err) => console.error("Erro ao buscar casas:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FeaturedDestinationSkeleton />;

  const handleNext = () => { if (swiperRef.current) swiperRef.current.slideNext(); };
  const handlePrev = () => { if (swiperRef.current) swiperRef.current.slidePrev(); };

  return (
    <div className="flex flex-col items-center bg-slate-50 py-16 pb-10">
      <p className="px-6 md:px-16 lg:px-24 text-xl md:text-xl text-gray-600/90 -mt-8 max-2-174">
        {t("featured.title")}
      </p>

      <div className="relative w-full max-w-7xl mx-auto mt-10">
        <button
          onClick={handlePrev}
          className="hidden md:flex absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
        >
          <img src={leftarrow} className="w-5 h-5" alt="Anterior" />
        </button>

        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={20}
          loop={true}
          breakpoints={{
            320: { slidesPerView: 1.15, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
            640: { slidesPerView: 2, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
            768: { slidesPerView: 3, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
            1024: { slidesPerView: 3.5, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
            1280: { slidesPerView: 4, slidesOffsetBefore: 0, slidesOffsetAfter: 0 },
          }}
        >
          {houses.map((house) => (
            <SwiperSlide key={house.id}>
              <BeachCard house={house} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button
          onClick={handleNext}
          className="hidden md:flex absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
        >
          <img src={rightarrow} className="w-5 h-5" alt="Próximo" />
        </button>
      </div>
    </div>
  );
};

export default FeaturedDestination;