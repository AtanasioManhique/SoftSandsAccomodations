import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HouseCard from "../componentshouse/HouseCard";
import {useTranslation} from "react-i18next"
export default function PraiaPage() {
  const { praia } = useParams();
  const [houses, setHouses] = useState([]);
  const {t} = useTranslation();
  useEffect(() => {
    fetch("/data/casas.json")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (house) =>
            house.location.toLowerCase() === praia.toLowerCase()
        );
        setHouses(filtered);
      });
  }, [praia]);

  return (
    <div className="p-6 mt-20">
      <h1 className="text-2xl font-bold mb-6">
        {t("beachpage.homes")} {praia}
      </h1>

      {houses.length === 0 && (
        <p className="text-gray-600 text-lg">
         {t("beachpage.found")}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {houses.map((house) => (
          <HouseCard key={house.id} house={house} />
        ))}
      </div>
    </div>
  );
}
