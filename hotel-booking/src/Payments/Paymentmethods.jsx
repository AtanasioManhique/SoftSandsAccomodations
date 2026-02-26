// FormDropDown/PaymentMethods.jsx
import React from "react";

const methods = [
  {
    id: "Visa",
    label: "Visa / Cartão",
    description: "Pague com cartão de crédito ou débito",
    icon: (
      <svg className="w-7 h-7" viewBox="0 0 48 48" fill="none">
        <rect width="48" height="48" rx="8" fill="#1A1F71"/>
        <path d="M19 31L21.5 17H25L22.5 31H19Z" fill="white"/>
        <path d="M33.5 17.3C32.7 17 31.5 16.7 30 16.7C26.6 16.7 24.2 18.4 24.2 20.8C24.2 22.6 25.9 23.6 27.2 24.2C28.5 24.8 29 25.2 29 25.8C29 26.7 27.9 27.1 26.9 27.1C25.5 27.1 24.7 26.9 23.5 26.4L23 26.2L22.5 29.3C23.4 29.7 25 30.1 26.7 30.1C30.3 30.1 32.7 28.4 32.7 25.8C32.7 24.4 31.8 23.3 29.9 22.4C28.7 21.8 28 21.4 28 20.8C28 20.2 28.7 19.6 30.1 19.6C31.2 19.6 32 19.8 32.7 20.1L33 20.2L33.5 17.3Z" fill="white"/>
        <path d="M38 17H35.3C34.5 17 33.9 17.2 33.5 18L28.5 31H32.1L32.8 29H37.1L37.5 31H41L38 17ZM33.8 26.4L35.4 21.9L36.3 26.4H33.8Z" fill="white"/>
        <path d="M16.5 17L13.1 26.5L12.7 24.5C12 22.3 9.9 19.9 7.5 18.7L10.6 31H14.2L19.6 17H16.5Z" fill="white"/>
        <path d="M9.5 17H4L3.9 17.3C8.3 18.4 11.2 21 12.7 24.5L11.1 18C10.8 17.2 10.2 17 9.5 17Z" fill="#F9A533"/>
      </svg>
    ),
  },
  {
    id: "M-Pesa",
    label: "M-Pesa",
    description: "Pague com a sua conta M-Pesa",
    icon: (
      <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center">
        <span className="text-white text-xs font-bold leading-none">M</span>
      </div>
    ),
  },
  {
    id: "e-Mola",
    label: "e-Mola",
    description: "Pague com a sua conta e-Mola",
    icon: (
      <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center">
        <span className="text-white text-xs font-bold leading-none">e</span>
      </div>
    ),
  },
];

export default function PaymentMethods({ onClose, onSelectVisa, onSelectMpesa, onSelectEmola }) {
  const handlers = {
    "Visa": onSelectVisa,
    "M-Pesa": onSelectMpesa,
    "e-Mola": onSelectEmola,
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4">

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Escolha o método</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition text-xl leading-none"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {methods.map((m) => (
            <button
              key={m.id}
              onClick={() => handlers[m.id]?.()}
              className="w-full flex items-center gap-4 p-4 border rounded-xl hover:border-black hover:bg-gray-50 transition-all text-left group"
            >
              {m.icon}
              <div>
                <p className="font-semibold text-gray-900 group-hover:text-black">{m.label}</p>
                <p className="text-xs text-gray-500">{m.description}</p>
              </div>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}