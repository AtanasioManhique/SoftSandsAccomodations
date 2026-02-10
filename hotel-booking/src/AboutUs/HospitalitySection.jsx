import React from "react";
import {useTranslation} from "react-i18next"
const HospitalitySection = () => {
  const {t}= useTranslation();
  return (
    <section className="flex flex-col md:flex-row w-full bg-gray min-h-[65vh]">
      {/* IMAGEM - lado esquerdo no desktop, em cima no mobile */}
      <div className="w-full md:w-[40%] flex justify-center items-center overflow-hidden max-h-[350px] md:max-h-[500px]">
        <img
          src={"/AboutImages/16.png"}
          alt="Bandeira de Moçambique"
          className="w-full h-full object-contain md:object-cover"
        />
      </div>

      {/* CONTEÚDO - texto principal e blocos */}
      <div className="w-full md:w-[60%] flex flex-col justify-center px-4 sm:px-6 md:px-12 py-10">
        {/* Título e parágrafo */}
        <div className="text-center md:text-left mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            {t("hospitalitysection.title")}
          </h2>

          <p className="text-gray-700 text-sm sm:text-base md:text-lg leading-relaxed max-w-2xl mx-auto md:mx-0">
            {t("hospitalitysection.description")}
          </p>
        </div>

        {/* Blocos: Orgulho Nacional / Charme Internacional */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {/* Orgulho Nacional */}
          <div>
            <h3 className="text-[#0099a8] font-bold text-lg sm:text-xl mb-3 text-center sm:text-left">
              {t("hospitalitysection.NationalPride")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center sm:text-left">
              {t("hospitalitysection.Nationaltext")}
            </p>
          </div>

          {/* Charme Internacional */}
          <div>
            <h3 className="text-[#0099a8] font-bold text-lg sm:text-xl mb-3 text-center sm:text-left">
              {t("hospitalitysection.InternationalCharm")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center sm:text-left">
              {t("hospitalitysection.Internationaltext")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalitySection;
