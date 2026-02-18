import { Link } from "react-router-dom";
import fullstar from "../assets/fullstar.png";
import locationicon from "../assets/location.png";
import FavoriteButton from "../componentshouse/FavoriteButton";
import { useTranslation } from "react-i18next";

// ⭐ HOOK CENTRAL
import {useSeasonPricing} from "../context/seasonPricing.js";

const BeachCard = ({ house }) => {
  const { t } = useTranslation();

  // ⭐ Preço centralizado (temporada + moeda)
        const { getNightPrice } = useSeasonPricing();
        const { formatted } = getNightPrice(house.price);


  return (
    <div className="relative block bg-white rounded-2xl overflow-hidden border border-gray-100 transition hover:scale-[1.02] sm:mx-0">

      <FavoriteButton house={house} />

      <Link to={`/casas/${house.id}`} onClick={() => scrollTo(0, 0)}>
        <img
          src={house.image[0]}
          alt={house.location}
          className="w-full h-40 sm:h-44 md:h-48 object-cover"
        />

        <div className="p-2 flex flex-col gap-1.5">
          <div className="flex items-center text-sm text-gray-600 gap-1">
            <img src={locationicon} alt="localização" className="w-4 h-4" />
            <span className="truncate">{house.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">
              {formatted} / {t("favorites.night")}
            </span>

            <div className="flex items-center gap-1 text-sm text-gray-700">
              <img src={fullstar} alt="rating" className="w-4 h-4" />
              <span>{house.rating}</span>
            </div>
          </div>
        </div>
      </Link>

      <Link to={`/casas/${house.id}#reserveid`}>
        <button className="mx-3 mb-3 mt-1 w-[calc(100%-1.5rem)] bg-gray-800 hover:bg-gray-900 text-white py-2 rounded-lg text-sm">
          {t("reservebutton")}
        </button>
      </Link>
    </div>
  );
};

export default BeachCard;
