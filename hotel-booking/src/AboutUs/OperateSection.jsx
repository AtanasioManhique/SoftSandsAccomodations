import React from "react";
import {useTranslation} from "react-i18next"

const OperateSection = () => {
  const {t} = useTranslation();
  return (
    <section className="bg-gray w-full flex flex-col items-center py-5 px-4 sm:px-6 md:px-12 ">
      {/* TÍTULO */}
      <h2 className="text-2xl sm:text-3xl font-bold mb-8 text-gray-900 text-center mt-5">
        {t("operatesection.title")}
      </h2>

      {/* PARÁGRAFOS */}
      <div className="max-w-3xl text-center mb-12">
        <p className="text-gray-700 text-base sm:text-lg mb-4 leading-relaxed">
           {t("operatesection.description")}
        </p>
      </div>

      {/* GRID MISSÃO / VALORES / COMPROMISSO */}
      <div className="w-full sm:w-[90%] md:w-[80%] lg:w-[70%]">
        {/* --- Layout TRIANGULAR no MOBILE --- */}
        <div className="flex flex-col items-center w-full md:hidden">
          <div className="flex justify-center gap-4 w-full mb-4">
            {/* 2 em cima */}
            <div className="bg-white shadow-md rounded-2xl p-4 w-1/2">
              <h3 className="text-[#c37b3b] font-semibold mb-2 text-center">
                {t("operatesection.Maputo")}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                 {t("operatesection.MaputoInfo")}
              </p>
            </div>

            <div className="bg-white shadow-md rounded-2xl p-4 w-1/2">
              <h3 className="text-[#c37b3b] font-semibold mb-2 text-center">
                {t("operatesection.Gaza")}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed text-center">
                {t("operatesection.GazaInfo")}
              </p>
            </div>
          </div>

          {/* 1 em baixo, centralizado */}
          <div className="bg-white shadow-md rounded-2xl p-4 w-[70%]">
            <h3 className="text-[#c37b3b] font-semibold mb-2 text-center">
              {t("operatesection.Inhambane")}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed text-center">
              {t("operatesection.InhambaneInfo")}
            </p>
          </div>
        </div>

        {/* --- Layout NORMAL no DESKTOP --- */}
        <div className="hidden md:grid grid-cols-3 gap-8">
          <div>
            <h3 className="text-[#c37b3b] font-medium mb-2 text-center sm:text-left">
              {t("operatesection.Maputo")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center sm:text-left">
                   {t("operatesection.MaputoInfo")}
            </p>
          </div>

          <div>
            <h3 className="text-[#c37b3b] font-medium mb-2 text-center sm:text-left">
              {t("operatesection.Gaza")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center sm:text-left">
               {t("operatesection.GazaInfo")}
            </p>
          </div>

          <div>
            <h3 className="text-[#c37b3b] font-medium mb-2 text-center sm:text-left">
              {t("operatesection.Inhambane")}
            </h3>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed text-center sm:text-left">
                {t("operatesection.InhambaneInfo")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OperateSection;
