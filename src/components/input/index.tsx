import { InputProps } from "./types";

export const Input: React.FC<InputProps> = ({ error, ...rest }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      <input
        {...rest}
        className="w-full p-4 bg-[#F6F3FC] rounded-lg placeholder-[#5F5F5F] placeholder:font-poppins"
      />
      {!!error && <p className="font-poppins text-red-500 text-sm">{error}</p>}
    </div>
  );
};
