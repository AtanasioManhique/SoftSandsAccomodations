// src/components/FeaturedDestination.jsx
import { useEffect, useState, useRef } from "react";
import { api } from "../services/api";
import BeachCard, { BeachCardSkeleton } from "./BeachCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import rightarrow from "../assets/right-arrow.png";
import leftarrow from "../assets/leftarrow.png";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────
/* // 🚧 DEV — Lê casas adicionadas pelo admin no localStorage
// Remove quando o backend estiver pronto.
const DEV_KEY = "dev_casas_admin";
const devGetCasas = () => {
  try { return JSON.parse(localStorage.getItem(DEV_KEY)) || []; }
  catch { return []; }
};
// 🚧 fim bloco DEV ──────────────────────────────────────────── */

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const FeaturedDestinationSkeleton = () => (
  <div className="flex flex-col items-center bg-slate-50 py-16 pb-10">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{ ...shimmerStyle, width: "320px", height: "20px", borderRadius: "6px", marginBottom: "40px" }} />
    <div className="w-full max-w-7xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 px-4">
        {[...Array(4)].map((_, i) => <BeachCardSkeleton key={i} />)}
      </div>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────

const FeaturedDestination = () => {
  const [houses, setHouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const swiperRef             = useRef(null);
  const { t }                 = useTranslation();

  const loadHouses = async () => {
    try {
      const res = await api.get("/accommodations", { params: { limit: 12 } });
      const data = res.data?.data ?? res.data;
      setHouses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar casas:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHouses();

    /* // 🚧 DEV — recarrega quando o admin adiciona uma casa
    const handleDevUpdate = () => loadHouses();
    window.addEventListener("dev_casas_updated", handleDevUpdate);
    return () => window.removeEventListener("dev_casas_updated", handleDevUpdate);
    // 🚧 fim DEV */
  }, []);

  if (loading) return <FeaturedDestinationSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center bg-slate-50 py-16 pb-10">
      <p className="text-gray-400 text-sm">{t("featured.error") || "Erro ao carregar casas."}</p>
    </div>
  );

  const handleNext = () => swiperRef.current?.slideNext();
  const handlePrev = () => swiperRef.current?.slidePrev();

  return (
    <div className="flex flex-col items-center bg-slate-50 py-16 pb-10">
      <p className="px-6 md:px-16 lg:px-24 text-xl text-gray-600/90 mt-4 max-w-2xl">
        {t("featured.title")}
      </p>

      <div className="relative w-full max-w-7xl mx-auto mt-10">
        <button onClick={handlePrev}
          className="hidden md:flex absolute left-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
          aria-label={t("common.prev") || "Anterior"}>
          <img src={leftarrow} className="w-5 h-5" alt="" />
        </button>

        <Swiper
          modules={[Navigation, Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          spaceBetween={20}
          loop={true}
          breakpoints={{
            320:  { slidesPerView: 1.15, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
            640:  { slidesPerView: 2,    slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
            768:  { slidesPerView: 3,    slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
            1024: { slidesPerView: 3.5,  slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
            1280: { slidesPerView: 4,    slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
          }}
        >
          {houses.map((house) => (
            <SwiperSlide key={house.id}>
              <BeachCard house={house} />
            </SwiperSlide>
          ))}
        </Swiper>

        <button onClick={handleNext}
          className="hidden md:flex absolute right-[-20px] top-1/2 -translate-y-1/2 bg-white shadow-md rounded-full p-2 hover:bg-gray-100 z-10 transition"
          aria-label={t("common.next") || "Próximo"}>
          <img src={rightarrow} className="w-5 h-5" alt="" />
        </button>
      </div>
    </div>
  );
};

export default FeaturedDestination;