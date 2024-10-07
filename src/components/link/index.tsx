import clsx from "clsx";
import { LinkProps } from "./types";

export const Link: React.FC<LinkProps> = ({
  variant = "primary",
  children,
  href,
}) => {
  return (
    <div className="group">
      <a href={href}>
        <p
          className={clsx("font-poppins font-normal text-base", {
            "text-[#35205D]": variant === "primary",
            "text-[#FFFFFF]": variant === "secondary",
          })}
        >
          {children}
        </p>
      </a>
      <div
        className={clsx(
          "h-[2px] scale-x-0 group-hover:scale-x-100 transform-origin-center rounded-full transition-transform duration-300",
          {
            "bg-[#35205D]": variant === "primary",
            "bg-[#FFFFFF]": variant === "secondary",
          }
        )}
      />
    </div>
  );
};
