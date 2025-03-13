import { SkillCard } from "../../../components/skill-card";
import { SKILLS } from "./constants";

export const Skills: React.FC = () => {
  const openLink = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <section
      className="flex flex-col items-center justify-center md:px-[100px] mb-[115px] pt-[114px]"
      id="skills"
    >
      <h1 className="font-poppins font-bold text-3xl md:text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        My Skills
      </h1>
      <p className="px-4 font-poppins font-normal text-base lg:text-xl text-[#5F5F5F] text-center max-w-[764px] mb-16">
        I transform your vision into a distinctive experience that captivates
        both you and your audience.
      </p>
      <div className="flex gap-6 flex-wrap items-center justify-center">
        {SKILLS.map((skill, index) => (
          <SkillCard
            onClick={() => openLink(skill.link)}
            data={skill}
            key={index}
          />
        ))}
      </div>
    </section>
  );
};
