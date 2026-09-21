import { GoArrowUpRight, GoArrowDownRight } from "react-icons/go";
import clsx from "clsx";
import type { ServiceTableProps } from "./types";

export const ServiceTable: React.FC<ServiceTableProps> = ({ data }) => {
  const getIcon = (isHighlighted: boolean) => {
    if (isHighlighted) {
      return <GoArrowUpRight size={40} className="text-white" />;
    }

    return <GoArrowDownRight size={40} className="text-primary-500" />;
  };

  return (
    <table className="w-full">
      <tbody>
        {data.map(({ description, isHighlighted, title }, index) => (
          <tr
            key={index}
            /* Sem cursor-pointer e sem realce de texto/borda: a linha não é
               clicável, então o único retorno de hover é um fundo sutil. */
            className={clsx("transition-colors duration-300 ease-out", {
              "bg-gradient-to-r from-primary-500 to-primary-900 hover:from-primary-400 hover:to-primary-800":
                isHighlighted,
              "bg-transparent hover:bg-primary-50": !isHighlighted,
            })}
          >
            <td
              className={clsx(
                "hidden xl:table-cell font-poppins font-semibold text-4xl transition-colors duration-300",
                {
                  "text-white": isHighlighted,
                  "text-primary-700": !isHighlighted,
                  "border-b border-gray-300": !isHighlighted,
                }
              )}
            >
              {(index + 1).toString().padStart(2, "0")}
            </td>
            <td
              className={clsx(
                "font-poppins font-bold md:text-[32px] text-[40px] transition-colors duration-300",
                {
                  "text-white": isHighlighted,
                  "text-primary-700": !isHighlighted,
                  "border-b border-gray-300": !isHighlighted,
                }
              )}
            >
              {/* Título de verdade: a célula sozinha não entrava na lista de
                  títulos do leitor de tela, então os quatro serviços não
                  existiam para quem navega por eles. `h3` porque o `h2` é o
                  título da seção. O preflight do Tailwind faz o heading herdar
                  tamanho e peso, então o desenho não muda. */}
              <h3>{title}</h3>
            </td>
            <td
              className={clsx(
                "w-[525px] font-poppins font-normal text-xl transition-colors duration-300",
                {
                  "text-white": isHighlighted,
                  "text-gray-700": !isHighlighted,
                  "border-b border-gray-300": !isHighlighted,
                }
              )}
            >
              {description}
            </td>
            <td
              className={clsx("hidden xl:table-cell", {
                "border-b border-gray-300": !isHighlighted,
              })}
            >
              {getIcon(isHighlighted)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
