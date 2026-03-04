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
    <div className="flex flex-col items-center bg-slate-50 pt-8 pb-2">

      {/* ✅ Title com padding correto */}
      <div className="w-full px-6 md:px-16 lg:px-24">
        <Title
          title={t("testimonial.title")}
          subTitle={t("testimonial.subtitle")}
        />
      </div>

      {/* ✅ Espaçamento lateral para o swiper */}
       
      <div className="relative w-full mt-8 px-4 md:px-16 lg:px-24">
  <Swiper
    modules={[Autoplay]}
    onSwiper={(swiper) => (swiperRef.current = swiper)}
    autoplay={{ delay: 3000, disableOnInteraction: true }}
    spaceBetween={20}
    loop={false}
    /* ✅ ESTA PROPRIEDADE É A CHAVE */
    autoHeight={false} 
    className="!pb-10" // Padding no fundo para a sombra não ser cortada
    breakpoints={{
      320: { slidesPerView: 1.1 },
      640: { slidesPerView: 1.5},
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
    }}
  >
    {testimonials.map((testimonial, index) => (
      <SwiperSlide key={index} className="!h-auto"> {/* ✅ !h-auto obriga o slide a esticar */}
        <div className="
          bg-white shadow-md rounded-2xl p-6 
          flex flex-col h-full  /* ✅ h-full faz todos terem a mesma altura */
          transition-all duration-300 border border-gray-100">
          
          {/* Nome */}
          <div className="flex items-center gap-3">
            <p className="font-playfair text-xl">
              {t(`testimonials.${index}.name`)}
            </p>
          </div>

          {/* Estrelas */}
          <div className="flex items-center gap-1 mt-4">
            <StarRating rating={t(`testimonials.${index}.rating`)} />
          </div>

          {/* Review - O flex-grow garante que o espaço vazio seja preenchido aqui */}
          <p className="text-gray-500 mt-4 flex-grow break-words">
            {t(`testimonials.${index}.review`)}
          </p>

          {/* Tipo - Ficará sempre alinhado ao fundo */}
          <div className="mt-6 border-t pt-4 border-gray-50">
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
