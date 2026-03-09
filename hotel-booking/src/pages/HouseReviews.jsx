import { useState, useMemo } from "react";
import StarRating from "../components/Star.jsx";
import { useTranslation } from "react-i18next";

// ── Skeleton do HouseReviews ──────────────────────────────────
// Exportado para ser usado no HouseDetails enquanto os dados
// da casa ainda estão a carregar.
//
// Uso no HouseDetails:
//   import HouseReviews, { HouseReviewsSkeleton } from "../components/HouseReviews";
//   {loadingHouse ? <HouseReviewsSkeleton /> : <HouseReviews house={house} />}
// ─────────────────────────────────────────────────────────────
const shimmerStyle = {
  background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.4s infinite",
};

export const HouseReviewsSkeleton = () => (
  <div className="mt-12 space-y-8 px-4 sm:px-0">
    <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

    {/* Título */}
    <div style={{ ...shimmerStyle, width: "200px", height: "28px", borderRadius: "6px" }} />

    {/* Categorias — 4 barras */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#f9fafb", borderRadius: "12px" }}>
          <div style={{ ...shimmerStyle, width: "90px", height: "14px", borderRadius: "4px", flexShrink: 0 }} />
          <div style={{ flex: 1, height: "8px", background: "#e5e7eb", borderRadius: "999px", overflow: "hidden" }}>
            <div style={{ ...shimmerStyle, width: "100%", height: "100%" }} />
          </div>
          <div style={{ ...shimmerStyle, width: "30px", height: "14px", borderRadius: "4px", flexShrink: 0 }} />
        </div>
      ))}
    </div>

    <hr className="border-gray-300" />

    {/* Comentários — 3 placeholders */}
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {[...Array(3)].map((_, i) => (
        <div key={i} style={{ border: "1px solid #e5e7eb", borderRadius: "16px", padding: "16px", background: "#fff", display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Nome + data */}
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ ...shimmerStyle, width: "120px", height: "14px", borderRadius: "4px" }} />
              <div style={{ ...shimmerStyle, width: "80px", height: "12px", borderRadius: "4px" }} />
            </div>
            <div style={{ ...shimmerStyle, width: "70px", height: "12px", borderRadius: "4px", alignSelf: "flex-start" }} />
          </div>
          {/* Estrelas */}
          <div style={{ display: "flex", gap: "4px" }}>
            {[...Array(5)].map((_, s) => (
              <div key={s} style={{ ...shimmerStyle, width: "16px", height: "16px", borderRadius: "3px" }} />
            ))}
          </div>
          {/* Comentário — 2 linhas */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ ...shimmerStyle, width: "100%", height: "13px", borderRadius: "4px" }} />
            <div style={{ ...shimmerStyle, width: "75%", height: "13px", borderRadius: "4px" }} />
          </div>
        </div>
      ))}
    </div>
  </div>
);
// ─────────────────────────────────────────────────────────────

const HouseReviews = ({ house }) => {
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation();

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

      {/* Categorias */}
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
              />
            </div>

            <span className="text-sm sm:text-base font-semibold text-blue-700 min-w-[32px] text-right">
              {cat.nota.toFixed(1)}
            </span>
          </div>
        ))}
      </div>

      <hr className="border-gray-300" />

      {/* Lista de comentários */}
      <div className="space-y-6">
        {reviewsToShow.map((review) => (
          <div
            key={review.id}
            className="border border-gray-200 sm:border-0 rounded-2xl sm:rounded-none p-4 sm:p-0 shadow-sm sm:shadow-none bg-white sm:bg-transparent"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <span className="font-semibold text-gray-900">{review.user_name}</span>
                <span className="text-sm text-gray-500">{review.user_location}</span>
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

      {/* Mostrar mais / menos */}
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