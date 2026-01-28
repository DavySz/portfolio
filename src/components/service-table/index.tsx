import { GoArrowUpRight, GoArrowDownRight } from "react-icons/go";
import clsx from "clsx";
import type { ServiceTableProps } from "./types";

export const ServiceTable: React.FC<ServiceTableProps> = ({ data }) => {
  const getIcon = (isHighlighted: boolean) => {
    if (isHighlighted) {
      return (
        <GoArrowUpRight
          size={40}
          className="text-white transition-transform duration-300 group-hover:scale-110"
        />
      );
    }

    return (
      <GoArrowDownRight
        size={40}
        className="text-primary-500 transition-transform duration-300 group-hover:scale-110 group-hover:text-primary-600"
      />
    );
  };

  return (
    <table className="w-full">
      <tbody>
        {data.map(({ description, isHighlighted, title }, index) => (
          <tr
            key={index}
            className={clsx(
              "group cursor-pointer transition-all duration-300 ease-out",
              {
                "bg-gradient-to-r from-primary-500 to-primary-900 hover:from-primary-400 hover:to-primary-800":
                  isHighlighted,
                "bg-transparent hover:bg-primary-50": !isHighlighted,
              }
            )}
          >
            <td
              className={clsx(
                "hidden xl:table-cell font-poppins font-semibold text-4xl transition-colors duration-300",
                {
                  "text-white": isHighlighted,
                  "text-primary-700 group-hover:text-primary-800":
                    !isHighlighted,
                  "border-b border-gray-300 group-hover:border-primary-300":
                    !isHighlighted,
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
                  "text-primary-700 group-hover:text-primary-800":
                    !isHighlighted,
                  "border-b border-gray-300 group-hover:border-primary-300":
                    !isHighlighted,
                }
              )}
            >
              {title}
            </td>
            <td
              className={clsx(
                "w-[525px] font-poppins font-normal text-xl transition-colors duration-300",
                {
                  "text-white": isHighlighted,
                  "text-gray-700 group-hover:text-gray-800": !isHighlighted,
                  "border-b border-gray-300 group-hover:border-primary-300":
                    !isHighlighted,
                }
              )}
            >
              {description}
            </td>
            <td
              className={clsx("hidden xl:table-cell", {
                "border-b border-gray-300 group-hover:border-primary-300":
                  !isHighlighted,
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
