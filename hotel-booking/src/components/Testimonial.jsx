import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {useTranslation} from "react-i18next"
import {testimonials} from "../assets/assets.js"
import Title from "../components/Title";
import StarRating from "./Star";

const Testimonial = () => {
  const {t} = useTranslation();
  const swiperRef = useRef(null);

  return (
    <div className="flex flex-col items-center px-6 md:px-16 lg:px-24 bg-slate-50 pt-10 pb-15">
      <Title
        title={t("testimonial.title")}
        subTitle={t("testimonial.subtitle")}
      />

      <div className="relative w-full mt-8">
        <Swiper
          modules={[Autoplay]}
          onSwiper={(swiper) => (swiperRef.current = swiper)}
          autoplay={{ delay: 2000, disableOnInteraction: true }}
          spaceBetween={20}
          loop={false} // 🚫 não volta para o primeiro slide
          breakpoints={{
            320: { slidesPerView: 1.1 },
            640: { slidesPerView: 1.5 },
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
     
        >
          {testimonials.map((testimonial,index) => (
            <SwiperSlide key={index}>
              <div className="bg-white shadow-md rounded-lg p-4 flex flex-col justify-between 
                              h-[280px] md:h-[320px] transition-all duration-300">
                {/* Nome */}
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-playfair text-xl">{t(`testimonials.${index}.name`)}</p>
                  </div>
                </div>

                {/* Estrelas */}
                <div className="flex items-center gap-1 mt-4">
                  <StarRating rating={t(`testimonials.${index}.rating`)} />
                </div>

                {/* Review */}
                <p className="text-gray-500 mt-4 flex-grow line-clamp-4">
                  {t(`testimonials.${index}.review`)}
                </p>

                {/* Tipo */}
                <p className="text-gray-500 text-sm mt-5">{t(`testimonials.${index}.type`)}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Testimonial;
