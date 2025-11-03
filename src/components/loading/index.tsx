import clsx from "clsx";

interface LoadingProps {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  color?: "primary" | "white" | "gray";
}

export const Loading: React.FC<LoadingProps> = ({
  size = "md",
  variant = "spinner",
  color = "primary",
}) => {
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

  const getColorClasses = () => {
    switch (color) {
      case "primary":
        return "border-primary-600";
      case "white":
        return "border-white";
      case "gray":
        return "border-gray-600";
      default:
        return "border-primary-600";
    }
  };

  if (variant === "dots") {
    return (
      <div className="flex items-center justify-center space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              "rounded-full animate-pulse",
              getSizeClasses()
                .replace("h-7 w-7", "h-2 w-2")
                .replace("h-4 w-4", "h-1.5 w-1.5")
                .replace("h-10 w-10", "h-3 w-3"),
              {
                "bg-primary-600": color === "primary",
                "bg-white": color === "white",
                "bg-gray-600": color === "gray",
              }
            )}
            style={{
              animationDelay: `${i * 0.2}s`,
              animationDuration: "1.4s",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div className="flex items-center justify-center">
        <div
          className={clsx("rounded-full animate-pulse", getSizeClasses(), {
            "bg-primary-600": color === "primary",
            "bg-white": color === "white",
            "bg-gray-600": color === "gray",
          })}
        />
      </div>
    );
  }

  // Default spinner
  return (
    <div className="flex items-center justify-center">
      <div
        className={clsx(
          "animate-spin rounded-full border-t-2 border-r-2 border-transparent",
          getSizeClasses(),
          getColorClasses()
        )}
      />
    </div>
  );
};
