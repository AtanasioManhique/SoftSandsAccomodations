import fullstar from "../assets/fullstar.png";
import emptystar from "../assets/emptystar.png";
import halfstar from "../assets/halfstar.png";

const StarRating = ({ rating = 4.3, size = "w-5 h-5" }) => {
  return (
    <div className="flex items-center">
      {Array.from({ length: 5 }).map((_, index) => {
        if (rating >= index + 1) {
          // Estrela cheia
          return (
            <img
              key={index}
              src={fullstar}
              alt="Estrela cheia"
              className={size}
            />
          );
        } else if (rating > index && rating < index + 1) {
          // Meia estrela
          return (
            <img
              key={index}
              src={halfstar}
              alt="Meia estrela"
              className={size}
            />
          );
        } else {
          // Estrela vazia
          return (
            <img
              key={index}
              src={emptystar}
              alt="Estrela vazia"
              className={size}
            />
          );
        }
      })}
    </div>
  );
};

export default StarRating;
