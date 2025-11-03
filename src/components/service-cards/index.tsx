import clsx from "clsx";
import { ServiceCardsProps } from "./types";

export const ServiceCards: React.FC<ServiceCardsProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-2">
      {data.map(({ description, isHighlighted, title }, index) => (
        <div
          key={index}
          className={clsx(
            "flex flex-col gap-6 py-8 px-6 rounded-xl transition-all duration-300 ease-out",
            "hover:shadow-lg hover:-translate-y-1 cursor-pointer",
            {
              "bg-gradient-to-r from-primary-500 to-primary-900 hover:from-primary-400 hover:to-primary-800 hover:shadow-primary":
                isHighlighted,
              "bg-white hover:bg-primary-50 hover:shadow-primary/20":
                !isHighlighted,
            }
          )}
        >
          <h2
            className={clsx(
              "font-poppins font-bold text-xl transition-colors duration-300",
              {
                "text-white": isHighlighted,
                "text-primary-700 hover:text-primary-800": !isHighlighted,
              }
            )}
          >
            {title}
          </h2>
          <p
            className={clsx(
              "font-poppins font-normal text-base transition-colors duration-300",
              {
                "text-white": isHighlighted,
                "text-gray-700 hover:text-gray-800": !isHighlighted,
              }
            )}
          >
            {description}
          </p>
        </div>
      ))}
    </div>
  );
};
