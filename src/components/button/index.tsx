import clsx from "clsx";
import { ButtonProps, ButtonVariant } from "./types";

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  icon: Icon,
  disabled,
  children,
  ...rest
}) => {
  const getButtonVariant = (): string => {
    if (disabled) return "bg-gray-400";

    const variants: Record<ButtonVariant, string> = {
      primary: "bg-gradient-to-r from-[#7947DF] to-[#311961]",
      secondary: "bg-transparent border border-[#7544D7]",
      tertiary: "bg-transparent",
    };

    return variants[variant];
  };

  const getTextVariant = (): string => {
    if (disabled) return "text-white";

    const variants: Record<ButtonVariant, string> = {
      primary: "text-white",
      tertiary: "text-white",
      secondary: "text-[#7041CF]",
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

  return (
    <button
      {...rest}
      className={clsx(
        "flex gap-2 rounded-3xl items-center justify-center",
        getButtonVariant(),
        getButtonShape()
      )}
      disabled={disabled}
      type="submit"
    >
      {children && (
        <p
          className={clsx(
            "font-poppins font-semibold xl:text-xl text-base",
            getTextVariant()
          )}
        >
          {children}
        </p>
      )}
      {Icon && <Icon size={24} color={getIconColor()} />}
    </button>
  );
};
