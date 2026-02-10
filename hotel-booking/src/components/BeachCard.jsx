import { Link } from "react-router-dom";
import fullstar from "../assets/fullstar.png";
import locationicon from "../assets/location.png";
import FavoriteButton from "../componentshouse/FavoriteButton";
import { useTranslation } from "react-i18next";
import { useCurrency } from "../FormDropDown/CurrencyContext";
import { convertPrice, formatCurrency } from "../context/utils/currencyHelpers";

const BeachCard = ({ house }) => {

  const { t, i18n } = useTranslation();

  // ✅ moeda global
  const { currency, rates } = useCurrency();

  // ✅ preço base (sempre em ZAR)
  const basePrice = house.price.low_season;

  // ✅ conversão
  const convertedPrice = convertPrice(basePrice, currency, rates);

  // ✅ formatação automática por idioma
  const formattedPrice = formatCurrency(
    convertedPrice,
    currency,
    i18n.language
  );

  return (
    <div className="relative block bg-white rounded-2xl overflow-hidden shadow-md transition hover:scale-[1.02]">
      
      <FavoriteButton house={house} />

      <Link
        to={`/casas/${house.id}`}
        onClick={() => scrollTo(0, 0)}
      >
        <img
          src={house.image[0]}
          alt={house.location}
          className="w-full h-48 sm:h-56 object-cover"
        />

        <div className="p-3 flex flex-col gap-2">
          <div className="flex items-center text-sm text-gray-600 gap-1">
            <img src={locationicon} alt="localização" className="w-4 h-4" />
            <span className="truncate">{house.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              {formattedPrice} / {t("favorites.night")}
            </span>

            <div className="flex items-center gap-1 text-sm text-gray-700">
              <img src={fullstar} alt="rating" className="w-4 h-4" />
              <span>{house.rating}</span>
            </div>
          </div>
        </div>
      </Link>

      <Link to={`/casas/${house.id}#reserveid`}>
        <button
          className="mx-3 mb-3 mt-1 w-[calc(100%-1.5rem)] bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-sm"
        >
          {t("reservebutton")}
        </button>
      </Link>
    </div>
  );
};

export default BeachCard;
