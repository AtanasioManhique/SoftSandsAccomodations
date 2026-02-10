import React from "react";
import {useTranslation} from "react-i18next"
export default function ContacteNos() {

  const {t}= useTranslation();
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      {/* TÍTULO */}
      <h1 className="text-3xl font-bold mb-2 mt-7">{t("contactus.contact")}</h1>
      <p className="text-gray-600 mb-10">
            {t("contactus.description")}
      </p>

      <div className="space-y-4">

        {/* TELEFONE */}
        <a
          href=""
          className="block bg-white border rounded-2xl p-5 hover:shadow transition"
        >
          <h2 className="text-lg font-semibold mb-1">{t("contactus.phone")}</h2>
          <p className="text-gray-600 text-sm mb-3">
            {t("contactus.phonetitle")}
          </p>
          <span className="font-semibold text-gray-900">
            +258 87 594 1153
          </span>
        </a>

        {/* EMAIL */}
        <a
          href=""
          className="block bg-white border rounded-2xl p-5 hover:shadow transition"
        >
          <h2 className="text-lg font-semibold mb-1">Email</h2>
          <p className="text-gray-600 text-sm mb-3">
            {t("contactus.mailtitle")}
          </p>
          <span className="text-blue-600 font-semibold break-all">
            softsandsbookings87@gmail.com
          </span>
        </a>

        {/* WHATSAPP */}
        <a
          href="https://chat.whatsapp.com/Ivm1DTrdgjoIhV9sWbE5Xl"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border rounded-2xl p-5 hover:shadow transition"
        >
          <h2 className="text-lg font-semibold mb-1">WhatsApp</h2>
          <p className="text-gray-600 text-sm mb-3">
            {t("contactus.wpptitle")}
          </p>
          <span className="text-green-600 font-semibold">
            {t("contactus.openwpp")}
          </span>
        </a>

        {/* INSTAGRAM */}
        <a
          href="https://www.instagram.com/softsandsaccommodation/"
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-white border rounded-2xl p-5 hover:shadow transition"
        >
          <h2 className="text-lg font-semibold mb-1">Instagram</h2>
          <p className="text-gray-600 text-sm mb-3">
              {t("contactus.igtitle")}
          </p>
          <span className="text-pink-600 font-semibold">
              @softsandsaccommodation
          </span>
        </a>

      </div>
    </div>
  );
}
