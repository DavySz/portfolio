import clsx from "clsx";
import { useState } from "react";
import type { ButtonProps } from "./types";
import { Loading } from "../loading";
import {
  BASE_CLASSES,
  LABEL_CLASSES,
  iconColor,
  labelClasses,
  shapeClasses,
  surfaceClasses,
} from "./styles";

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  isLoading = false,
  full = false,
  icon: Icon,
  disabled,
  children,
  type,
  ...rest
}) => {
  const [isPressed, setIsPressed] = useState(false);
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
        BASE_CLASSES,
        /* Ternário, não soma: o gradiente é background-image e pintaria por
           cima do bg-gray-400 do estado desabilitado. */
        disabled ? "bg-gray-400" : surfaceClasses(variant),
        shapeClasses(variant, Boolean(children)),
        {
          "w-full": full,
          "cursor-not-allowed opacity-60": disabled,
          "animate-pulse": isPressed && !disabled,
        }
      )}
      disabled={disabled}
      /* `button` por padrão: dentro de um <form>, o padrão do HTML é submit,
         e um botão de rede social não deveria enviar formulário. Quem
         precisar de submit passa type explicitamente. */
      type={type ?? "button"}
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
            LABEL_CLASSES,
            disabled ? "text-white" : labelClasses(variant)
          )}
        >
          {children}
        </p>
      )}
      {Icon && !isLoading && (
        <span className="transition-transform duration-300 hover:rotate-12">
          <Icon size={24} color={iconColor(variant)} />
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
