import React, { useState } from "react";
import {useTranslation} from "react-i18next"

export default function PaymentCardForm({ onClose, onSuccess }) {
  const [form, setForm] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: "",
    country: "",
  });

  const [errors, setErrors] = useState({});
  const {t} = useTranslation();

  const countries = [
    "Angola", "Argentina", "Australia", "Brazil", "Botswana", "Canada", "Chile",
    "China", "Colombia", "Egypt", "France", "Germany", "Ghana", "India", "Italy",
    "Japan", "Kenya", "Mexico", "Morocco", "Mozambique", "Netherlands", "Nigeria",
    "Norway", "Portugal", "Qatar", "Saudi Arabia", "Singapore", "South Africa",
    "South Korea", "Spain", "Sweden", "Switzerland", "Turkey", "United Arab Emirates",
    "United Kingdom", "United States", "Zambia", "Zimbabwe"
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  // ---------------- VALIDATIONS ----------------

  // Luhn Algorithm -> Valida número real de cartão
  const validateLuhn = (number) => {
    let sum = 0;
    let shouldDouble = false;

    for (let i = number.length - 1; i >= 0; i--) {
      let digit = parseInt(number[i]);

      if (shouldDouble) {
        digit = digit * 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
  };

  const validate = () => {
    const newErrors = {};

    // Nome
    if (!form.name.trim()) newErrors.name = t("card.errorname");

    // Número do cartão
    const numericNumber = form.number.replace(/\s+/g, "");
    if (!numericNumber.match(/^\d{16,19}$/))
      newErrors.number = t("card.cardnumber");
    else if (!validateLuhn(numericNumber))
      newErrors.number = t("card.formatdata");

    // Expiry
    if (!form.expiry.match(/^(0[1-9]|1[0-2])\/\d{2}$/)) {
      newErrors.expiry = t("card.formatdata");
    } else {
      const [MM, YY] = form.expiry.split("/");
      const expiryDate = new Date(`20${YY}`, MM - 1);
      const now = new Date();

    
    }

    // CVV
    if (!form.cvv.match(/^\d{3,4}$/))
      newErrors.cvv = t("card.cvvformat");

    // Country
    if (!form.country) newErrors.country = t("card.country");

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // ---------------- HANDLE DONE ----------------
  const handleDone = () => {
    if (!validate()) return;

    // FUTURA INTEGRAÇÃO COM API DE PAGAMENTO
    // Exemplo:
    // await api.post("/save-card", form);

    onSuccess();
  };

  return (
    <div className="fixed inset-0 bg-gray-200/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6 space-y-6 animate-fadeIn">
        
        {/* Top */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{t("card.title")}</h2>

          {/* FIX: agora fecha */}
          <button type="button" onClick={onClose} className="text-xl">
            ×
          </button>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-3">
          <img src="/icons/visa.png" className="h-6" alt="" />
          <img src="/icons/card.png" className="h-4" alt="" />
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder={t("card.cardholder")}
              className="w-full border rounded-lg p-3"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>

          <div>
            <input
              type="text"
              name="number"
              placeholder="Card number"
              className="w-full border rounded-lg p-3"
              value={form.number}
              onChange={handleChange}
            />
            {errors.number && <p className="text-red-600 text-sm">{errors.number}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                name="expiry"
                placeholder="Expiration (MM/YY)"
                className="border rounded-lg p-3 w-full"
                value={form.expiry}
                onChange={handleChange}
              />
              {errors.expiry && <p className="text-red-600 text-sm">{errors.expiry}</p>}
            </div>

            <div>
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                className="border rounded-lg p-3 w-full"
                value={form.cvv}
                onChange={handleChange}
              />
              {errors.cvv && <p className="text-red-600 text-sm">{errors.cvv}</p>}
            </div>
          </div>

          <div>
            <select
              name="country"
              className="w-full border rounded-lg p-3"
              value={form.country}
              onChange={handleChange}
            >
              <option value="">{t("card.select")}</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {errors.country && <p className="text-red-600 text-sm">{errors.country}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4 border-t">
          {/* FIX: agora fecha */}
          <button type="button" onClick={onClose} className="underline">
            {t("card.cancel")}
          </button>

          <button
            type="button"
            onClick={handleDone}
            className="bg-black text-white px-5 py-2 rounded-lg"
          >
           {t("card.done")}
          </button>
        </div>
      </div>
    </div>
  );
}
