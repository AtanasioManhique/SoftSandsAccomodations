import { cards } from "../assets/assets.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// ── Skeleton ──────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

const FeatureSectionSkeleton = () => (
  <section className="bg-white py-10 px-2 text-center">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "40px" }}>
      <div style={{ ...shimmerStyle, width: "180px", height: "36px", borderRadius: "6px" }} />
      <div style={{ ...shimmerStyle, width: "140px", height: "36px", borderRadius: "6px" }} />
    </div>
    <div className="hidden md:grid grid-cols-3 gap-8 max-w-7xl mx-auto">
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
          <div style={{ ...shimmerStyle, width: "48px", height: "48px", borderRadius: "50%" }} />
          <div style={{ ...shimmerStyle, width: "140px", height: "22px", borderRadius: "6px" }} />
          <div style={{ ...shimmerStyle, width: "100%", height: "14px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "85%", height: "14px", borderRadius: "4px" }} />
          <div style={{ ...shimmerStyle, width: "70%", height: "14px", borderRadius: "4px" }} />
        </div>
      ))}
    </div>
    <div className="block md:hidden max-w-md mx-auto">
      <div style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #f0f0f0", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
        <div style={{ ...shimmerStyle, width: "48px", height: "48px", borderRadius: "50%" }} />
        <div style={{ ...shimmerStyle, width: "140px", height: "22px", borderRadius: "6px" }} />
        <div style={{ ...shimmerStyle, width: "100%", height: "14px", borderRadius: "4px" }} />
        <div style={{ ...shimmerStyle, width: "85%", height: "14px", borderRadius: "4px" }} />
      </div>
    </div>
  </section>
);
// ─────────────────────────────────────────────────────────────

const FeatureSection = () => {
  const { t }              = useTranslation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <FeatureSectionSkeleton />;

  return (
    // Corrigido: "-pt-5" classe inválida removida
    <section className="bg-white py-10 px-2 text-center">
      <h2 className="text-4xl font-bold text-gray-800 mb-10">
        {t("featuresection.title")}{" "}
        <span className="text-emerald-600">{t("featuresection.name")}</span>?
      </h2>

      {/* Mobile - Swiper */}
      <div className="block md:hidden w-full max-w-md mx-auto">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          spaceBetween={16}
          slidesPerView={1.1}
          className="!pb-10 !px-2"
        >
          {cards.map((card, index) => (
            // cards é array estático — key={index} aceitável
            <SwiperSlide key={`card-mobile-${index}`}>
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between h-full">
                <div className="flex flex-col items-center flex-grow">
                  <img src={card.image} alt="" className="h-12 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-emerald-600 mb-2">
                    {t(`cards.${index}.title`)}
                  </h3>
                  <p className="text-gray-600 text-base line-clamp-4">
                    {t(`cards.${index}.description`)}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop - Grid */}
      <div className="hidden md:grid grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
        {cards.map((card, index) => (
          <div
            key={`card-desktop-${index}`}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-xl transition flex flex-col justify-between"
          >
            <div className="flex flex-col items-center flex-grow">
              <img src={card.image} alt="" className="h-12 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-emerald-600 mb-2">
                {t(`cards.${index}.title`)}
              </h3>
              <p className="text-gray-600 text-base line-clamp-4">
                {t(`cards.${index}.description`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;