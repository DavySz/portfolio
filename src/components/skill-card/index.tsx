import { SkillCardProps } from "./types";

export const SkillCard: React.FC<SkillCardProps> = ({ data }) => {
  return (
    <div className="flex flex-col items-center justify-center">
      <div className="bg-[#F6F3FC] rounded-[30px] h-[150px] w-[150px] flex flex-col items-center justify-center mb-5">
        {data.icon}
      </div>
      <p className="font-poppins font-normal text-[#8B50F7] text-xl">
        {data.title}
      </p>
    </div>
  );
};
