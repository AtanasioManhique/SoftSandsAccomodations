import { useState } from "react";
import React from "react";
import rightarrow from "../assets/right-arrow.png";
import leftarrow from "../assets/leftarrow.png";
import {useTranslation} from "react-i18next"
const GaleriaCasa = ({ casa }) => {
  const [mainImage, setMainImage] = useState(casa.image[0]);
  const [showCarousel, setShowCarousel] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const {t}= useTranslation();
  const prevImage = () => {
    setCurrentIndex((prev) => (prev === 0 ? casa.image.length - 1 : prev - 1));
    setMainImage(casa.image[currentIndex === 0 ? casa.image.length - 1 : currentIndex - 1]);
  };

  const nextImage = () => {
    setCurrentIndex((prev) => (prev === casa.image.length - 1 ? 0 : prev + 1));
    setMainImage(casa.image[currentIndex === casa.image.length - 1 ? 0 : currentIndex + 1]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 relative">
      {/* Imagem principal */}
      <div className="lg:w-1/2 w-full relative">
        <img
          src={mainImage}
          alt="Imagem principal da casa"
          className="w-full h-[250px] sm:h-[320px] md:h-[400px] object-cover rounded-xl shadow-lg"
        />

        {/* Botão Mostrar todas */}
        <button
          onClick={() => setShowCarousel(true)}
          className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg shadow-md border hover:bg-gray-100 transition text-sm sm:text-base"
        >
          {t("center.photos")}
        </button>
      </div>

      {/* Miniaturas (apenas visíveis no desktop) */}
      <div className="hidden lg:grid grid-cols-2 gap-4 w-1/2">
        {casa.image.slice(0, 4).map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Casa ${casa.name} - ${index + 1}`}
            onClick={() => {
              setMainImage(img);
              setCurrentIndex(index);
            }}
            className={`w-full h-[190px] object-cover rounded-xl shadow-md cursor-pointer transition-all duration-200 ${
              mainImage === img ? "ring-4 ring-blue-500" : "hover:opacity-80"
            }`}
          />
        ))}
      </div>

      {/* Slider horizontal (mobile) */}
      <div className="flex lg:hidden overflow-x-auto gap-2 mt-2">
        {casa.image.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Casa ${casa.name} - ${index}`}
            onClick={() => {
              setMainImage(img);
              setCurrentIndex(index);
            }}
            className={`w-28 h-24 flex-shrink-0 object-cover rounded-lg cursor-pointer transition-all duration-200 ${
              mainImage === img ? "ring-2 ring-blue-500" : "hover:opacity-80"
            }`}
          />
        ))}
      </div>

      {/* Carrossel estilo Airbnb */}
      {showCarousel && (
        <div className="fixed inset-0 bg-white/95 text-black z-50 flex flex-col items-center justify-center">
          {/* Top bar */}
          <div className="flex justify-between items-center w-full max-w-6xl px-6 py-4">
            <h2 className="text-sm sm:text-lg font-medium text-black-200">
              {currentIndex + 1} / {casa.image.length} – {casa.name}
            </h2>
            <button
              onClick={() => setShowCarousel(false)}
              className="text-black-300 hover:text-black text-xl font-medium"
            >
              ✖
            </button>
          </div>

          {/* Foto principal */}
          <div className="relative w-full max-w-4xl flex items-center justify-center">
            <button
              onClick={prevImage}
              className="absolute left-2 sm:left-6 bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 transition"
            >
              <img src={leftarrow} className="w-4 h-4 sm:w-6 sm:h-6 invert" alt="Anterior" />
            </button>
            <img
              src={casa.image[currentIndex]}
              alt={`Casa ${casa.name} - ${currentIndex}`}
              className="w-full max-h-[70vh] object-contain rounded-lg"
            />

            <button
              onClick={nextImage}
              className="absolute right-2 sm:right-6 bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 transition"
            >
              <img src={rightarrow} className="w-4 h-4 sm:w-6 sm:h-6 invert" alt="Próxima" />
            </button>
          </div>

          {/* Miniaturas (scroll horizontal) */}
          <div className="flex gap-2 mt-4 sm:mt-6 overflow-x-auto px-4 sm:px-6">
            {casa.image.map((img, index) => (
              <img
                key={index}
                src={img}
                onClick={() => {
                  setCurrentIndex(index);
                  setMainImage(img);
                }}
                alt={`Casa ${casa.name} - miniatura ${index}`}
                className={`w-20 h-16 sm:w-24 sm:h-20 object-cover rounded-md cursor-pointer border-2 ${
                  currentIndex === index
                    ? "border-blue-500"
                    : "border-transparent hover:border-gray-400"
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GaleriaCasa;
