import { useState, useMemo } from "react";
import StarRating from "../components/Star.jsx";
import {useTranslation} from "react-i18next"
const HouseReviews = ({ house }) => {
  const [showAll, setShowAll] = useState(false);
  const {t} = useTranslation();
  // Cálculo das médias por categoria
  const categoriesData = useMemo(() => {
    const categorySums = {};
    const categoryCounts = {};
  
    house.reviews.forEach((review) => {
      Object.entries(review.categories || {}).forEach(([key, value]) => {
        categorySums[key] = (categorySums[key] || 0) + Number(value);
        categoryCounts[key] = (categoryCounts[key] || 0) + 1;
      });
    });

    return Object.keys(categorySums).map((key) => {
      const avg = categorySums[key] / categoryCounts[key];
      return { categoria: key, nota: avg };
    });
  }, [house.reviews]);

  const reviewsToShow = showAll ? house.reviews : house.reviews.slice(0, 5);

  return (
    <div id="reviews" className="mt-12 space-y-8 px-4 sm:px-0">
      {/* Título */}
      <h2 className="text-2xl font-semibold mb-2 text-gray-800">
       {t("housereviews.avaliations")}
      </h2>

      {/* --- CATEGORIAS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {categoriesData.map((cat) => (
          <div
            key={cat.categoria}
            className="flex items-center justify-between gap-3 bg-gray-50 sm:bg-transparent rounded-xl p-3 sm:p-0"
          >
            <span className="text-sm sm:text-base font-medium text-gray-700 capitalize">
              {t(`categories.${cat.categoria}`)}
            </span>

            <div className="flex-1 mx-3 h-2 bg-gray-200 rounded-full relative">
              <div
                className="absolute left-0 top-0 h-2 bg-blue-700 rounded-full transition-all duration-300"
                style={{ width: `${(cat.nota / 5) * 100}%` }}
              ></div>
            </div>

            <span className="text-sm sm:text-base font-semibold text-blue-700 min-w-[32px] text-right">
              {cat.nota.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-gray-300" />

      {/* --- LISTA DE COMENTÁRIOS --- */}
      <div className="space-y-6">
        {reviewsToShow.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 sm:border-0 rounded-2xl sm:rounded-none p-4 sm:p-0 shadow-sm sm:shadow-none bg-white sm:bg-transparent"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-semibold text-gray-900">
                  {review.user_name}
                </span>
                <span className="text-sm text-gray-500">
                  {review.user_location}
                </span>
              </div>
              <span className="text-xs text-gray-500 mt-1 sm:mt-0">
                {new Date(review.date).toLocaleDateString("pt-PT")}
              </span>
            </div>

            <StarRating rating={review.stars} />

            <p className="text-gray-700 mt-2 leading-relaxed text-sm sm:text-base">
              {review.comment}
            </p>
          </div>
        ))}
      </div>

      {/* Botão Mostrar mais */}
      {house.reviews.length > 5 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-blue-700 font-medium underline hover:text-blue-800 transition"
          >
            {showAll ? t("housereviews.less") : t("housereviews.more")}
          </button>
        </div>
      )}
    </div>
  );
};

export default HouseReviews;
