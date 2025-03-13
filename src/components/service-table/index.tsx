import { GoArrowUpRight, GoArrowDownRight } from "react-icons/go";
import clsx from "clsx";
import { ServiceTableProps } from "./types";

export const ServiceTable: React.FC<ServiceTableProps> = ({ data }) => {
  const getIcon = (isHighlighted: boolean) => {
    if (isHighlighted) {
      return <GoArrowUpRight size={40} className="text-[#FFFFFF]" />;
    }

    return <GoArrowDownRight size={40} className="text-[#7947DF]" />;
  };

  return (
    <table className="w-full">
      <tbody>
        {data.map(({ description, isHighlighted, title }, index) => (
          <tr
            key={index}
            className={clsx({
              "bg-gradient-to-r from-[#7947DF] to-[#311961]": isHighlighted,
              "bg-transparent": !isHighlighted,
            })}
          >
            <td
              className={clsx(
                "hidden xl:table-cell font-poppins font-semibold text-4xl",
                {
                  "text-white": isHighlighted,
                  "text-[#7041CF]": !isHighlighted,
                  "border-b border-[#A9A9A9]": !isHighlighted,
                }
              )}
            >
              {(index + 1).toString().padStart(2, "0")}
            </td>
            <td
              className={clsx(
                "font-poppins font-bold md:text-[32px] text-[40px]",
                {
                  "text-white": isHighlighted,
                  "text-[#7041CF]": !isHighlighted,
                  "border-b border-[#A9A9A9]": !isHighlighted,
                }
              )}
            >
              {title}
            </td>
            <td
              className={clsx("w-[525px] font-poppins font-normal text-xl", {
                "text-white": isHighlighted,
                "text-[#000000]": !isHighlighted,
                "border-b border-[#A9A9A9]": !isHighlighted,
              })}
            >
              {description}
            </td>
            <td
              className={clsx("hidden xl:table-cell", {
                "border-b border-[#A9A9A9]": !isHighlighted,
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
