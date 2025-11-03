import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { ProjectCard } from "../../../components/project-card";
import { ProjectCardSkeleton } from "../../../components/project-card-skeleton";
import { Text } from "../../../components/text";
import { getProjects } from "./constants";

export const Projects: React.FC = () => {
  const { t } = useTranslation("home");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="projects"
      className="flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
    >
      <Text
        as="h1"
        variant="sectionTitle"
        color="gradient"
        align="center"
        className="text-display-sm md:text-display-md mb-6"
      >
        {t("projects.title")}
      </Text>
      <Text
        as="p"
        variant="sectionDescription"
        color="secondary"
        align="center"
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed"
        maxWidth="764px"
      >
        {t("projects.description")}
      </Text>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-center w-full max-w-7xl">
        {isLoading
          ? // Skeleton loading state
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-full"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <ProjectCardSkeleton />
              </div>
            ))
          : // Real content
            getProjects(t).map((project, index) => (
              <div
                key={index}
                className="animate-fade-in-up h-full"
                style={{
                  animationDelay: `${index * 0.2}s`,
                }}
              >
                <ProjectCard {...project} />
              </div>
            ))}
      </div>
    </section>
  );
};
