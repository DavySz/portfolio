import { useTranslation } from "react-i18next";
import { FaMedium } from "react-icons/fa";
import { ArticleCard } from "../../../components/article-card";
import { Text } from "../../../components/text";
import { Button } from "../../../components/button";
import { CONTACTS } from "../../../shared/constants";
import { ARTICLES } from "../../../content/articles";

export const Articles: React.FC = () => {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("component");

  const labels = {
    read: tc("article.read"),
    onMedium: tc("article.onMedium"),
  };

  return (
    <section
      id="articles"
      className="flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
    >
      <Text
        as="h1"
        variant="sectionTitle"
        color="gradient"
        align="center"
        className="text-display-sm md:text-display-md mb-6"
      >
        {t("articles.title")}
      </Text>
      <Text
        as="p"
        variant="sectionDescription"
        color="secondary"
        align="center"
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed"
        maxWidth="764px"
      >
        {t("articles.description")}
      </Text>

      <ul className="grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {ARTICLES.map((article) => (
          <li key={article.slug} className="h-full">
            <ArticleCard article={article} labels={labels} />
          </li>
        ))}
      </ul>

      <div className="mt-12">
        <Button
          variant="secondary"
          icon={FaMedium}
          onClick={() => window.open(CONTACTS.MEDIUM, "_blank")}
        >
          {t("articles.seeMore")}
        </Button>
      </div>
    </section>
  );
};
