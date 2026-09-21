import { useTranslation } from "react-i18next";
import { SkillCard } from "../../../components/skill-card";
import { Text } from "../../../components/text";
import { SKILLS } from "./constants";

export const Skills: React.FC = () => {
  const { t } = useTranslation("home");
  return (
    <section
      className="flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
      id="skills"
    >
      <Text
        as="h2"
        variant="sectionTitle"
        color="gradient"
        align="center"
        className="text-display-sm md:text-display-md mb-6"
      >
        {t("skills.title")}
      </Text>
      <Text
        as="p"
        variant="sectionDescription"
        color="secondary"
        align="center"
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed max-w-section"
      >
        {t("skills.description")}
      </Text>

      <div className="flex gap-6 flex-wrap items-center justify-center">
        {SKILLS.map((skill, index) => (
          <div
            key={skill.title}
            className="animate-fade-in-up"
            style={{
              animationDelay: `${index * 0.05}s`,
            }}
          >
            <SkillCard data={skill} />
          </div>
        ))}
      </div>
    </section>
  );
};
