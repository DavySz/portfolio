import clsx from "clsx";
import { ServiceCardsProps } from "./types";

export const ServiceCards: React.FC<ServiceCardsProps> = ({ data }) => {
  return (
    <div>
      {data.map(({ description, isHighlighted, title }, index) => (
        <div
          key={index}
          className={clsx("flex flex-col gap-6 py-8 px-6", {
            "bg-gradient-to-r from-[#7947DF] to-[#311961]": isHighlighted,
            "bg-transparent": !isHighlighted,
          })}
        >
          <h2
            className={clsx("font-poppins font-bold text-xl", {
              "text-white": isHighlighted,
              "text-[#7041CF]": !isHighlighted,
            })}
          >
            {title}
          </h2>
          <p
            className={clsx("font-poppins font-normal text-base", {
              "text-white": isHighlighted,
              "text-[#000000]": !isHighlighted,
            })}
          >
            {description}
          </p>
        </div>
      ))}
    </div>
  );
};
