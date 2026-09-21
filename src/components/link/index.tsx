import clsx from "clsx";
import type { LinkProps } from "./types";

export const Link: React.FC<LinkProps> = ({
  variant = "primary",
  children,
  href,
}) => {
  return (
    <div className="group relative">
      <a
        href={href}
        className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-4"
      >
        <p
          className={clsx(
            "font-poppins font-normal text-base lg:text-xl transition-all duration-300 ease-out",
            "relative z-10",
            {
              "text-secondary-900 hover:text-primary-600":
                variant === "primary",
              "text-white hover:text-primary-300": variant === "secondary",
            }
          )}
        >
          {children}
        </p>
      </a>
      <div
        className={clsx(
          "absolute bottom-0 left-0 h-[2px] w-0 rounded-full",
          "group-hover:w-full group-focus-within:w-full",
          "transition-all duration-300 ease-out",
          {
            "bg-primary-500": variant === "primary",
            "bg-primary-300": variant === "secondary",
          }
        )}
      />
      {/* Hover background effect */}
      <div
        className={clsx(
          "absolute inset-0 rounded-lg opacity-0",
          "group-hover:opacity-100 group-focus-within:opacity-100",
          "transition-opacity duration-300 ease-out -m-2 p-2",
          {
            "bg-primary-50": variant === "primary",
            "bg-white/10": variant === "secondary",
          }
        )}
      />
    </div>
  );
};
