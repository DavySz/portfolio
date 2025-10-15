import { useTranslation } from "react-i18next";
import { SkillCard } from "../../../components/skill-card";
import { SKILLS } from "./constants";

export const Skills: React.FC = () => {
  const { t } = useTranslation("home");

  const openLink = (link: string): void => {
    window.open(link, "_blank");
  };

  return (
    <section
      className="flex flex-col items-center justify-center md:px-[100px] mb-[115px] pt-[114px]"
      id="skills"
    >
      <h1 className="text-center font-poppins font-bold text-3xl md:text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        {t("skills.title")}
      </h1>
      <p className="px-4 font-poppins font-normal text-base lg:text-xl text-[#5F5F5F] text-center max-w-[764px] mb-16">
        {t("skills.description")}
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
