// src/utils/currency.js

const locales = {
  ZAR: "en-ZA",
  MZN: "pt-MZ",
  USD: "en-US",
  EUR: "pt-PT",
};

const symbols = {
  ZAR: "R",
  MZN: "MZN",
  USD: "$",
  EUR: "€",
};

export const formatCurrency = (value, currency = "ZAR") => {
  if (value == null) return "—";

  const locale = locales[currency] ?? "en-ZA";
  const symbol = symbols[currency] ?? currency;
  const formatted = Number(value).toLocaleString(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  return `${symbol} ${formatted}`;
};

export const convertPrice = (value, fromCurrency, toCurrency, rates) => {
  if (value == null || !rates) return null;
  if (fromCurrency === toCurrency) return value;

  const valueInZAR = value / (rates[fromCurrency] ?? 1);
  const valueInTarget = valueInZAR * (rates[toCurrency] ?? 1);

  return valueInTarget;
};