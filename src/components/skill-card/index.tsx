import { SkillCardProps } from "./types";

export const SkillCard: React.FC<SkillCardProps> = ({ data, onClick }) => {
  return (
    <div
      className="group cursor-pointer flex flex-col items-center justify-center"
      onClick={onClick}
    >
      <div className="bg-[#F6F3FC] rounded-[30px] h-[150px] w-[150px] flex flex-col items-center justify-center mb-5 group-hover:bg-[#2A1454] transition-all duration-200 group-hover:-translate-y-5">
        {data.icon}
      </div>
      <p className="font-poppins font-normal text-[#8B50F7] text-xl">
        {data.title}
      </p>
    </div>
  );
};
