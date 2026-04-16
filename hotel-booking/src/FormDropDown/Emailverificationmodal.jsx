// FormDropDown/EmailVerificationModal.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {useTranslation} from "reaact-i18next"
const EmailVerificationModal = ({ email, onClose }) => {
  const navigate = useNavigate();
  const [closing, setClosing] = useState(false);
  const {t} = useTranslation();
  const handleGoToLogin = () => {
    setClosing(true);
    setTimeout(() => {
      onClose?.();
      navigate("/login");
    }, 300);
  };

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        closing ? "opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
    >
      <div
        className={`bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center relative transition-all duration-300 ${
          closing ? "scale-95 opacity-0" : "scale-100 opacity-100"
        }`}
      >
        {/* Botão fechar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
          aria-label="Fechar"
        >
          ✕
        </button>

        {/* Ícone animado */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative w-20 h-20">
            {/* Círculo de fundo */}
            <div className="absolute inset-0 rounded-full bg-blue-50 animate-pulse" />
            {/* Envelope SVG */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-10 h-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25H4.5a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5H4.5a2.25 2.25 0 00-2.25 2.25m19.5 0L12 13.5 2.25 6.75"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Título */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {t("verification.title")}
        </h2>

        {/* Subtítulo */}
        <p className="text-gray-500 text-sm mb-1">
       {t("verification.subtitle")}
        </p>
        {email && (
          <p className="text-blue-600 font-semibold text-sm mb-4 break-all">
            {email}
          </p>
        )}

        {/* Instruções */}
        <div className="bg-blue-50 rounded-xl px-5 py-4 mb-6 text-left space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-blue-400 mt-0.5 text-base">1.</span>
            <p className="text-gray-600 text-sm">{t("verification.open")}.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-400 mt-0.5 text-base">2.</span>
            <p className="text-gray-600 text-sm">{t("verification.click")} <span className="font-medium text-gray-700">"{t("verification.confirm")}"</span> {t("verification.active")}.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-blue-400 mt-0.5 text-base">3.</span>
            <p className="text-gray-600 text-sm">{t("verification.confirmation")}.</p>
          </div>
        </div>

        {/* Botão principal */}
        <button
          onClick={handleGoToLogin}
          className="w-full bg-blue-600 text-white py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all mb-3"
        >
            {t("verification.login")}
        </button>

        {/* Nota de spam */}
        <p className="text-xs text-gray-400">
         {t("verification.email")}
        </p>
      </div>
    </div>
  );
};

export default EmailVerificationModal;