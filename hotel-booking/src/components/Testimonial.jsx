import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import { useTranslation } from "react-i18next";
import { testimonials } from "../assets/assets.js";
import Title from "../components/Title";
import StarRating from "./Star";

const Testimonial = () => {
  const { t }      = useTranslation();
  const swiperRef  = useRef(null);

  return (
    <div className="flex flex-col items-center bg-slate-50 pt-8 pb-2">

      <div className="w-full px-6 md:px-16 lg:px-24">
        <Title
          title={t("testimonial.title")}
          subTitle={t("testimonial.subtitle")}
        />
      </div>

      <div className="relative w-full mt-8 px-4 md:px-16 lg:px-24">
        <Swiper
          modules={[Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{ delay: 3000, disableOnInteraction: true }}
          spaceBetween={20}
          loop={false}
          autoHeight={false}
          className="!pb-10"
          breakpoints={{
            320:  { slidesPerView: 1.1 },
            640:  { slidesPerView: 1.5 },
            768:  { slidesPerView: 2   },
            1024: { slidesPerView: 3   },
          }}
        >
          {testimonials.map((testimonial, index) => (
            // Corrigido: key={index} aceitável aqui pois testimonials é
            // um array estático que nunca muda de ordem — sem ID disponível
            <SwiperSlide key={`testimonial-${index}`} className="!h-auto">
              <div className="bg-white shadow-md rounded-2xl p-6 flex flex-col h-full transition-all duration-300 border border-gray-100">

                <div className="flex items-center gap-3">
                  <p className="font-playfair text-xl">
                    {t(`testimonials.${index}.name`)}
                  </p>
                </div>

                <div className="flex items-center gap-1 mt-4">
                  {/* StarRating converte rating para Number internamente */}
                  <StarRating rating={t(`testimonials.${index}.rating`)} />
                </div>

                <p className="text-gray-500 mt-4 flex-grow break-words">
                  {t(`testimonials.${index}.review`)}
                </p>

                <div className="mt-6 border-t pt-4 border-gray-100">
                  <p className="text-gray-500 text-sm font-medium">
                    {t(`testimonials.${index}.type`)}
                  </p>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Testimonial;