import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { SkillCard } from "../../../components/skill-card";
import { SkillCardSkeleton } from "../../../components/skill-card-skeleton";
import { Text } from "../../../components/text";
import { SKILLS } from "./constants";

export const Skills: React.FC = () => {
  const { t } = useTranslation("home");
  const [isLoading, setIsLoading] = useState(true);

  const openLink = (link: string): void => {
    window.open(link, "_blank");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className="flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
      id="skills"
    >
      <Text
        as="h1"
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
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed"
        maxWidth="764px"
      >
        {t("skills.description")}
      </Text>

      <div className="flex gap-6 flex-wrap items-center justify-center">
        {isLoading
          ? // Skeleton loading state
            Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                style={{
                  animationDelay: `${index * 0.05}s`,
                }}
              >
                <SkillCardSkeleton />
              </div>
            ))
          : // Real content
            SKILLS.map((skill, index) => (
              <div
                key={index}
                className="animate-fade-in-up"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <SkillCard onClick={() => openLink(skill.link)} data={skill} />
              </div>
            ))}
      </div>
    </section>
  );
};
