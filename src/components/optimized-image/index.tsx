import { useState, memo } from "react";
import clsx from "clsx";
import type { OptimizedImageProps } from "./types";

export const OptimizedImage = memo<OptimizedImageProps>(
  ({
    src,
    alt,
    className,
    width,
    height,
    priority = false,
    placeholder,
    sizes,
    objectFit = "cover",
    loading = "lazy",
  }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    const handleLoad = () => {
      setIsLoaded(true);
    };

    const handleError = () => {
      setError(true);
      setIsLoaded(true);
    };

    const imageStyle: React.CSSProperties = {
      objectFit,
      width: width ? `${width}px` : "100%",
      height: height ? `${height}px` : "100%",
    };

    if (error) {
      return (
        <div
          className={clsx(
            "flex items-center justify-center bg-gray-200 text-gray-500",
            className,
          )}
          style={imageStyle}
        >
          <span className="text-sm">Imagem não encontrada</span>
        </div>
      );
    }

    return (
      <div className={clsx("relative overflow-hidden", className)}>
        {/* Loading placeholder */}
        {!isLoaded && (
          <div
            className={clsx(
              "absolute inset-0 bg-gray-200 animate-pulse",
              placeholder && "bg-center bg-cover",
            )}
            style={
              placeholder
                ? { backgroundImage: `url(${placeholder})` }
                : undefined
            }
          />
        )}

        {/* Main Image */}
        <img
          src={src}
          alt={alt}
          loading={priority ? "eager" : loading}
          sizes={sizes}
          onLoad={handleLoad}
          onError={handleError}
          style={imageStyle}
          className={clsx(
            "transition-opacity duration-300",
            isLoaded ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    );
  },
);
