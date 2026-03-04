import { cards } from "../assets/assets.js";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import {useTranslation} from "react-i18next"

const FeatureSection = () => {
  const {t}= useTranslation();
  return (
    <section className="bg-white py-10 px-2 text-center -pt-5">
      {/* Título */}
      <h2 className="text-4xl font-bold text-gray-800 mb-10">
        {t("featuresection.title")}{" "}
        <span className="text-emerald-600">{t("featuresection.name")}</span>?
      </h2>

      {/* 📱 Mobile - Swiper */}
      <div className="block md:hidden w-full max-w-md mx-auto">
        <Swiper
          modules={[Autoplay]}
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          spaceBetween={16}
          slidesPerView={1.1}
          className="!pb-10 !px-2"
        >
          {cards.map((card, index) => (
            <SwiperSlide key={index}>
              <div
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 
                           flex flex-col justify-between h-full"
              >
                <div className="flex flex-col items-center flex-grow">
                  <img
                    src={card.image}
                    alt={card.title}
                    className="h-12 mx-auto mb-4"
                  />
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

      {/* 💻 Desktop - Grid fixo */}
      <div className="hidden md:grid grid-cols-3 gap-8 max-w-7xl mx-auto items-stretch">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 
                       hover:shadow-xl transition flex flex-col justify-between"
          >
            <div className="flex flex-col items-center flex-grow">
              <img
                src={card.image}
                alt={card.title}
                className="h-12 mx-auto mb-4"
              />
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
