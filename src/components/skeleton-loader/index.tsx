import clsx from "clsx";

interface SkeletonLoaderProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className,
  variant = "rectangular",
  width,
  height,
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

  return (
    <div
      className={clsx("animate-shimmer", getVariantClasses(), className)}
      style={getSize()}
    />
  );
};
