import { SkillCard } from "../../../components/skill-card";
import { SKILLS } from "./constants";

export const Skills: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center px-[100px] mb-[115px]">
      <h1 className="font-poppins font-bold text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        My Skills
      </h1>
      <p className="font-poppins font-normal text-xl text-[#5F5F5F] text-center w-[764px] mb-16">
        I transform your vision into a distinctive experience that captivates
        both you and your audience.
      </p>
      <div className="flex gap-6 flex-wrap items-center justify-center">
        {SKILLS.map((skill, index) => (
          <SkillCard key={index} data={skill} />
        ))}
      </div>
    </div>
  );
};
