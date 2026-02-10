import React, { useState } from "react";
import {useTranslation} from "react-i18next"
export default function PaymentMethods({ onClose, onSelectVisa }) {
  const [showCardForm, setShowCardForm] = useState(false);
  const {t}= useTranslation();

  const methods = [
    {
      name: "Visa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg",
    },
    {
      name: "M-Pesa",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/M-Pesa_logo.svg/2560px-M-Pesa_logo.svg.png",
    },
  ];

  return (
    <div className="fixed inset-0 bg-gray-200/40 flex items-center justify-center bg-gray p-4 z-50">
      <div className="bg-white p-6 rounded-lg max-w-sm w-full">
        {!showCardForm && (
          <>
            <h2 className="text-xl font-semibold mb-4 text-center">{t("method.payment")}</h2>
            <div className="space-y-3">
              {methods.map((m) => (
                <button
                  key={m.name}
                  onClick={() => {
                    if (m.name === "Visa") onSelectVisa();
                  }}
                  className="flex items-center gap-3 border rounded-md p-3 w-full hover:bg-gray-100"
                >
                  <img src={m.logo} alt={m.name} className="w-10 h-10 object-contain" />
                  <span className="font-medium">{m.name}</span>
                </button>
              ))}
            </div>
            <button
              onClick={onClose}
              className="mt-5 w-full py-2 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              {t("method.close")}
            </button>
          </>
        )}

       
      </div>
    </div>
  );
}
