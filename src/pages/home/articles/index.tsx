import { useTranslation } from "react-i18next";
import { ProjectCard } from "../../../components/project-card";
import { getArticles } from "./constants";

export const Articles: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <section
      id="articles"
      className="px-5 xl:px-[230px] flex flex-col items-center justify-center mb-[112px] pt-[112px]"
    >
      <h1 className="text-center font-poppins font-bold text-3xl md:text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        {t("articles.title")}
      </h1>
      <p className="px-4 font-poppins font-normal text-base lg:text-xl text-[#5F5F5F] text-center max-w-[764px] mb-16">
        {t("articles.description")}
      </p>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 justify-center">
        {getArticles(t).map((article, index) => (
          <ProjectCard {...article} key={index} />
        ))}
      </div>
    </section>
  );
};
