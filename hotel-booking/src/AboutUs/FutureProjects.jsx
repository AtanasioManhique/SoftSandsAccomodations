
import React from "react";
import { Mail, Phone } from "lucide-react";
import {useTranslation} from "react-i18next"

const FutureProjects = () => {
  const {t} = useTranslation();
  return (
    <section className="bg-gray w-full flex flex-col items-center justify-center py-8 px-6 md:px-24">
      {/* Título */}
      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
        {t("future.title")}
      </h2>

      {/* Texto principal */}
      <div className="max-w-4xl text-gray-800 text-center md:text-left space-y-5 leading-relaxed">
        <p>
         {t("future.description")}
        </p>

        <p>
        {t("future.principaltext")}
        </p>

        <p className="text-[#0097a7] font-semibold text-lg md:text-xl mt-6">
          {t("future.subtext")}
        </p>
      </div>

      {/* Contatos */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-10 mt-10 text-gray-800">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 border border-gray-800 rounded-full p-1" />
          <span>softsandsbookings87@gmail.com</span>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="w-6 h-6 border border-gray-800 rounded-full p-1" />
          <span>(+258) 875941153</span>
        </div>
      </div>
    </section>
  );
};

export default FutureProjects;
