import React from "react";
import { useTranslation } from "react-i18next";



const AboutIntro = () => {

    const { t } = useTranslation();
  return (
    <section className="bg-gray w-full flex flex-row min-h-[70vh] mt-30 -mb-2">
      {/* IMAGEM LADO ESQUERDO */}
      <div className="w-[50%] md:w-[40%] h-auto">
        <img
          src={"/AboutImages/1.png"}
          alt="Soft Sands Accommodation"
          className="w-full h-full object-cover"
        />
      </div>

      {/* TEXTO LADO DIREITO */}
      <div className="w-[50%] flex flex-col justify-center relative px-3 sm:px-4 md:px-8 py-6 sm:py-10">

        {/* Título principal */}
        <h1 className="text-2xl sm:text-xl md:text-3xl font-bold mb-4 sm:mb-6 leading-tight text-gray-900">
          {t("aboutintro.title")}
        </h1>

        {/* Parágrafo */}
        <p className="text-gray-700 text-sm sm:text-base md:text-lg max-w-[95%] leading-relaxed">
          {t("aboutintro.description")}
          
        </p>
      </div>
    </section>
  );
};

export default AboutIntro;
