import clsx from "clsx";
import { useState } from "react";
import { ButtonProps, ButtonVariant } from "./types";
import { Loading } from "../loading";

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  full = false,
  icon: Icon,
  disabled,
  children,
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const getButtonVariant = (): string => {
    if (disabled) return "bg-gray-400";

    const variants: Record<ButtonVariant, string> = {
      primary:
        "bg-gradient-to-r from-[#7947DF] to-[#311961] hover:from-[#8A5AE6] hover:to-[#3D206E] shadow-lg hover:shadow-xl",
      secondary:
        "bg-transparent border border-[#7544D7] hover:bg-[#7544D7]/10 hover:border-[#8A5AE6] hover:shadow-lg",
      tertiary: "bg-transparent hover:bg-white/5",
    };

    return variants[variant];
  };

  const getTextVariant = (): string => {
    if (disabled) return "text-white";

    const variants: Record<ButtonVariant, string> = {
      primary: "text-white",
      tertiary: "text-white hover:text-[#B197E8]",
      secondary: "text-[#7041CF] hover:text-[#8A5AE6]",
    };

    return variants[variant];
  };

  const getButtonShape = (): string => {
    if (!children && !(variant === "tertiary")) return "p-4 rounded-full";
    if (variant === "tertiary") return "";
    return "py-2 px-8";
  };

  const getIconColor = (): string => {
    if (variant === "tertiary") return "#FFFFFF";
    return "#7041CF";
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  return (
    <button
      {...rest}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      className={clsx(
        "flex gap-2 rounded-3xl items-center justify-center relative overflow-hidden group",
        "transition-all duration-300 ease-out",
        "transform hover:scale-105 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-[#7947DF]/50 focus:ring-offset-2 focus:ring-offset-transparent",
        getButtonVariant(),
        getButtonShape(),
        {
          "w-full": full,
          "cursor-not-allowed opacity-60": disabled,
          "animate-pulse": isPressed && !disabled,
        }
      )}
      disabled={disabled}
      type="submit"
    >
      {/* Ripple effect */}
      {!disabled && (
        <span
          className={clsx(
            "absolute inset-0 rounded-3xl opacity-0 bg-white/20",
            "transition-opacity duration-150",
            "group-active:opacity-100"
          )}
        />
      )}

      {children && !isLoading && (
        <p
          className={clsx(
            "font-poppins font-semibold xl:text-xl text-base transition-colors duration-300",
            getTextVariant()
          )}
        >
          {children}
        </p>
      )}
      {Icon && !isLoading && (
        <span className="transition-transform duration-300 hover:rotate-12">
          <Icon size={24} color={getIconColor()} />
        </span>
      )}
      {isLoading && (
        <div className="animate-spin">
          <Loading />
        </div>
      )}
    </button>
  );
};
