import clsx from "clsx";
import { InputProps } from "./types";

export const Input: React.FC<InputProps> = ({ error, ...rest }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        {...rest}
        className={clsx(
          "w-full p-3 md:p-4 bg-[#F6F3FC] rounded-lg placeholder-[#5F5F5F] placeholder:font-poppins",
          {
            "border border-red-500": !!error,
          }
        )}
      />
      {!!error && (
        <p className="font-poppins text-red-500 text-xs md:text-sm">{error}</p>
      )}
    </div>
  );
};
