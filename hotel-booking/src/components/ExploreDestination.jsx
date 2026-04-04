// src/components/ExploreDestination.jsx
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

const ExploreDestinationSkeleton = () => (
  <div className="flex flex-col items-center pt-3 py-8 pb-[3.75rem]">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div className="w-full max-w-7xl">
      <div style={{ ...shimmerStyle, width: "200px", height: "28px", borderRadius: "6px", marginBottom: "24px" }} />
      <div className="flex gap-5 overflow-hidden">
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ minWidth: "220px", borderRadius: "12px", overflow: "hidden", flex: "0 0 220px" }}>
            <div style={{ ...shimmerStyle, width: "100%", height: "208px" }} />
            <div style={{ ...shimmerStyle, width: "70%", height: "18px", borderRadius: "6px", margin: "10px auto" }} />
          </div>
        ))}
      </div>
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────

const ExploreDestination = () => {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const swiperRef               = useRef(null);
  const { t }                   = useTranslation();

  const loadDestinos = async () => {
    try {
      const res = await api.get("/accommodations/destinations");
      const data = res.data?.data?.destinations ?? [];
      setDestinos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar destinos:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDestinos();

    /* // 🚧 DEV — recarrega quando o admin adiciona uma casa/praia nova
    const handleDevUpdate = () => loadDestinos();
    window.addEventListener("dev_casas_updated", handleDevUpdate);
    return () => window.removeEventListener("dev_casas_updated", handleDevUpdate);
    // 🚧 fim DEV */
  }, []);

  if (loading) return <ExploreDestinationSkeleton />;

  if (error) return (
    <div className="flex flex-col items-center pt-3 py-8 pb-[3.75rem]">
      <p className="text-gray-400 text-sm">{t("explore.error") || "Erro ao carregar destinos."}</p>
    </div>
  );

  const handleNext = () => swiperRef.current?.slideNext();
  const handlePrev = () => swiperRef.current?.slidePrev();

  return (
    <div className="flex flex-col items-center pt-3 py-8 pb-[3.75rem]">
      <div className="w-full max-w-7xl">
        <Title align="left" title={t("explore.destination")} />

        <div className="relative mt-6">
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
              320:  { slidesPerView: 1.2, slidesOffsetBefore: 16, slidesOffsetAfter: 16 },
              480:  { slidesPerView: 1.5, slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
              640:  { slidesPerView: 2,   slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
              768:  { slidesPerView: 3,   slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
              1024: { slidesPerView: 3.5, slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
              1280: { slidesPerView: 4,   slidesOffsetBefore: 0,  slidesOffsetAfter: 0  },
            }}
          >
            {destinos.map((destino) => (
              <SwiperSlide key={destino.name}>
                <Link
                  to={`/praias/${encodeURIComponent(destino.location)}`}
                  className="relative rounded-xl overflow-hidden shadow-sm hover:shadow-md group block"
                >
                  <img
                    src={destino.imageUrl}
                    alt={destino.location}
                    className="w-full h-52 object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-center py-3 text-lg font-semibold">
                    {destino.location} ({destino.accomodationCount})
                  </div>
                </Link>
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
    </div>
  );
};

export default ExploreDestination;