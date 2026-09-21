import clsx from "clsx";
import type { ServiceCardsProps } from "./types";

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
          {/* `h3`, não `h2`: o `h2` é o título da seção que contém estes
              cards. Como `h2` eles viravam irmãos da própria seção, e a
              hierarquia mudava conforme a largura da tela — o desktop, que
              usa a tabela, não declarava título nenhum. */}
          <h3
            className={clsx(
              "font-poppins font-bold text-xl transition-colors duration-300",
              {
                "text-white": isHighlighted,
                "text-primary-700 hover:text-primary-800": !isHighlighted,
              }
            )}
          >
            {title}
          </h3>
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
