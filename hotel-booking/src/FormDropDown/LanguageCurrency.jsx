import { useState } from "react";
import { useSettings } from "./SettingsContext";
import { useCurrency } from "./CurrencyContext";   // ✅ NOVO
import { useTranslation } from "react-i18next";

export default function LanguageCurrency() {

  const {
    language,
    setLanguage
  } = useSettings();

  // ✅ moeda vem do CurrencyContext
  const { currency, changeCurrency } = useCurrency();

  const [editField, setEditField] = useState(null);
  const [tempLanguage, setTempLanguage] = useState(language);
  const [tempCurrency, setTempCurrency] = useState(currency);

  const { t } = useTranslation();

  const save = () => {
    if (editField === "lang") {
      setLanguage(tempLanguage);
    }

    if (editField === "currency") {
      changeCurrency(tempCurrency); 
    }

    setEditField(null);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-8">
      <h2 className="text-2xl font-bold mb-6">
        {t("language.languagecurrency")}
      </h2>

      {/* Idioma */}
      <div className="border-b pb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{t("language.language")}</p>
            <p className="text-gray-500 capitalize">
              {language === "pt"
                ? t("language.portuguese")
                : t("language.english")}
            </p>
          </div>

          {!editField && (
            <button
              className="text-blue-600 font-semibold"
              onClick={() => setEditField("lang")}
            >
              {t("personaldata.edit")}
            </button>
          )}
        </div>

        {editField === "lang" && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <select
              className="border rounded px-3 py-2 w-full"
              value={tempLanguage}
              onChange={(e) => setTempLanguage(e.target.value)}
            >
              <option value="pt">{t("language.portuguese")}</option>
              <option value="en">{t("language.english")}</option>
            </select>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-black text-white rounded-xl"
                onClick={save}
              >
                {t("personaldata.save")}
              </button>

              <button
                className="px-4 py-2 bg-gray-200 rounded-xl"
                onClick={() => setEditField(null)}
              >
                {t("personaldata.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Moeda */}
      <div className="border-b pb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-semibold">{t("language.currency")}</p>
            <p className="text-gray-500">
              {currency} {currency === "MZN" && "(Metical)"}
            </p>
          </div>

          {!editField && (
            <button
              className="text-blue-600 font-semibold"
              onClick={() => setEditField("currency")}
            >
              {t("personaldata.edit")}
            </button>
          )}
        </div>

        {editField === "currency" && (
          <div className="mt-4 space-y-4 animate-fadeIn">
            <select
              className="border rounded px-3 py-2 w-full"
              value={tempCurrency}
              onChange={(e) => setTempCurrency(e.target.value)}
            >
              <option value="MZN">Metical (MZN)</option>
              <option value="USD">Dólar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="ZAR">Rand (ZAR)</option>
            </select>

            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-black text-white rounded-xl"
                onClick={save}
              >
                {t("personaldata.save")}
              </button>

              <button
                className="px-4 py-2 bg-gray-200 rounded-xl"
                onClick={() => setEditField(null)}
              >
                {t("personaldata.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
