import React from "react";
import { Link, useNavigate } from "react-router-dom";
import fullstar from "../assets/fullstar.png";
import locationicon from "../assets/location.png";
import FavoriteButton from "./FavoriteButton";
import { useTranslation } from "react-i18next";
import { useSeasonPricing } from "../context/seasonPricing.js"; // ✅ novo hook

const HouseCard = ({ house }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ✅ Hook central
  const { getNightPrice } = useSeasonPricing();
  const { formatted } = getNightPrice(house.price);

  const handleReserveClick = (e) => {
    e.preventDefault();
    const target = `/casas/${house.id}#reserveid`;
    navigate(target);

    setTimeout(() => {
      const el = document.getElementById("reserveid");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 160);
  };

  return (
    <div className="relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition block">
      <FavoriteButton house={house} />

      <Link to={`/casas/${house.id}`}>
        <img
          src={house.image[0]}
          alt={house.name}
          className="w-full h-48 object-cover"
        />
      </Link>

      <div className="p-4">
        <div className="flex items-center text-sm text-gray-500 gap-2">
          <img src={locationicon} alt="localização" className="w-4 h-4" />
          <span>{house.location}</span>
        </div>

        <div className="flex items-center justify-between mt-4">
          <span className="text-sm font-semibold text-gray-900">
            {formatted} / {t("favorites.night")}
          </span>

          <div className="flex items-center text-sm text-gray-700 gap-1">
            <img src={fullstar} alt="rating" className="w-4 h-4" />
            <span>{house.rating}</span>
          </div>
        </div>

        <button
          onClick={handleReserveClick}
          className="mt-3 w-full bg-gray-700 hover:bg-gray-800 text-white py-2 rounded-lg text-sm font-medium"
        >
          {t("reservebutton")}
        </button>
      </div>
    </div>
  );
};

export default HouseCard;
