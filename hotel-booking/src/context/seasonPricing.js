import { useCurrency } from "../FormDropDown/CurrencyContext";
import { convertPrice, formatCurrency } from "../context/utils/currencyHelpers";
import { useTranslation } from "react-i18next";

export function useSeasonPricing() {
  const { currency, rates } = useCurrency();
  const { i18n } = useTranslation();

  // 🔹 preço por noite baseado na temporada
  const getNightPrice = (priceObj, date = new Date()) => {
    if (!priceObj) return { raw: 0, formatted: "" };

    const month = new Date(date).getMonth() + 1;
    const lowSeason = month >= 2 && month <= 9;

    const base = lowSeason
      ? priceObj.low_season
      : priceObj.high_season;

    const converted = convertPrice(base, currency, rates);

    return {
      raw: converted,
      formatted: formatCurrency(converted, currency, i18n.language),
    };
  };

  // 🔹 preço total da reserva
  const getTotalPrice = (priceObj, startDate, endDate) => {
    if (!priceObj) return { nights: 0, raw: 0, formatted: "" };

    const start = new Date(startDate);
    const end = new Date(endDate);

    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const { raw } = getNightPrice(priceObj, startDate);

    const total = raw * nights;

    return {
      nights,
      raw: total,
      formatted: formatCurrency(total, currency, i18n.language),
    };
  };

  return {
    getNightPrice,
    getTotalPrice,
  };
}
