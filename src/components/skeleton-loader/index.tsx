import clsx from "clsx";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
  lines = 1,
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "text":
        return "h-4 rounded";
      case "circular":
        return "rounded-full";
      case "rectangular":
        return "rounded-lg";
      default:
        return "rounded-lg";
    }
  };

  const getSize = () => {
    const styles: React.CSSProperties = {};
    if (width) styles.width = typeof width === "number" ? `${width}px` : width;
    if (height)
      styles.height = typeof height === "number" ? `${height}px` : height;
    return styles;
  };

  if (variant === "text" && lines > 1) {
    return (
      <div className={clsx("space-y-2", className)}>
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={clsx("animate-shimmer", getVariantClasses(), {
              "w-full": index < lines - 1,
              "w-3/4": index === lines - 1,
            })}
            style={{
              ...getSize(),
              animationDelay: `${index * 0.1}s`,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx("animate-shimmer", getVariantClasses(), className)}
      style={getSize()}
    />
  );
};
