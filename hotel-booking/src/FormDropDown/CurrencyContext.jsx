import React, { createContext, useContext, useState, useEffect } from "react";
import { exchangeRates as localRates } from "../context/utils/currencyRates";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("ZAR");
  const [rates, setRates] = useState(localRates);

  // carregar moeda guardada
  useEffect(() => {
    const saved = localStorage.getItem("currency");
    if (saved) setCurrency(saved);
  }, []);

  // 👇 PREPARADO PARA BACKEND
  useEffect(() => {
    async function fetchRates() {
      try {
        // FUTURO:
        // const res = await fetch("/api/exchange-rates");
        // const data = await res.json();
        // setRates(data);

        // AGORA usa local
        setRates(localRates);

      } catch (err) {
        console.log("Erro taxas:", err);
        setRates(localRates);
      }
    }

    fetchRates();
  }, []);

  const changeCurrency = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem("currency", newCurrency);
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, rates }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
