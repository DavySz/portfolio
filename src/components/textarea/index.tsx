import clsx from "clsx";
import { TextareaProps } from "./types";

export const TextArea: React.FC<TextareaProps> = ({ error, ...rest }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <textarea
        {...rest}
        className={
          clsx("w-full p-4 bg-[#F6F3FC] rounded-lg placeholder-[#5F5F5F] placeholder:font-poppins", {
            "border border-red-500": !!error,
          })
        }
        style={{ resize: "none" }}
        rows={5}
      />
      {!!error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};
