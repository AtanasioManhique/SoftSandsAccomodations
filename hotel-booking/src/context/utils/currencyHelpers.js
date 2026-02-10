import { exchangeRates } from "./currencyRates";

// BASE CURRENCY = ZAR
export function convertPrice(price, currency, rates) {
  if (!rates || !rates[currency]) return price;
  return price * rates[currency];
}

export function formatCurrency(value, currency, locale) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency
  }).format(value);
}
