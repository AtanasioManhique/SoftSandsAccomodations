// src/FormDropDown/CurrencyContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";

const CurrencyContext = createContext();

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState("ZAR");
  const [rates, setRates] = useState({ ZAR: 1 });

  useEffect(() => {
    const saved = localStorage.getItem("currency");
    if (saved) setCurrency(saved);
  }, []);

  useEffect(() => {
    async function fetchRates() {
      try {
        const res = await api.get("/exchange-rates", { timeout: 30000});
        const data = res.data?.data ?? res.data;
        setRates({ [data.baseCurrency]: 1, ...data.rates });
      } catch (err) {
        console.error("Erro ao carregar taxas de câmbio:", err);
        setRates({ ZAR: 1 });
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