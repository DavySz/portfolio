import { memo } from "react";
import clsx from "clsx";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
}

export const Loading = memo<LoadingProps>(({ size = "md" }) => {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-4 w-4";
      case "md":
        return "h-7 w-7";
      case "lg":
        return "h-10 w-10";
      default:
        return "h-7 w-7";
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={clsx(
          "animate-spin rounded-full border-t-2 border-r-2 border-transparent border-primary-600",
          getSizeClasses(),
        )}
      />
    </div>
  );
});
