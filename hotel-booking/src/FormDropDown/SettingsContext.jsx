import { createContext, useContext, useState } from "react";
import i18n from "../i18n";

// Taxas de câmbio aproximadas (podes atualizar quando quiseres)
const rates = {
  MZN: 1,
  USD: 0.016,
  EUR: 0.015,
  ZAR: 0.29,
};

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export function SettingsProvider({ children }) {
  const [language, setLanguageState] = useState(
    localStorage.getItem("lang") || "pt"
  );
  const [currency, setCurrency] = useState("MZN");

  const setLanguage = (lang) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("lang", lang);
  };

  const convertPrice = (valueMZN) => {
    return (valueMZN * rates[currency]).toFixed(2);
  };

  return (
    <SettingsContext.Provider
      value={{
        language,
        setLanguage,
        currency,
        setCurrency,
        convertPrice,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
