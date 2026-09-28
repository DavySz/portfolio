import { useTranslation } from "react-i18next";
import { useExperienceSection } from "../../../hooks/useExperienceSection/use-experience-section";
import { CareerEntry } from "../../../components/career-entry";
import { Text } from "../../../components/text";
import { getCareer } from "./constants";

/**
 * A trilha de empresas, entre "Sobre mim" e "Expertise".
 *
 * `<ol>` e não `<ul>`: a ordem é a cronologia, do mais recente para o mais
 * antigo, e é informação — trocar a ordem dos itens muda o que a seção diz.
 *
 * A seção se registra no experience como as outras, mas nenhuma feature aponta
 * para `career`, então não há cena atrás dela. O registro é barato e deixa o
 * nó disponível caso uma feature passe a querer esta seção.
 */
export const Career: React.FC = () => {
  const { t } = useTranslation("home");
  const sectionRef = useExperienceSection("career");
  const entries = getCareer(t);

  return (
    <section
      ref={sectionRef}
      id="career"
      className="relative isolate flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
    >
      <Text
        as="h2"
        variant="sectionTitle"
        color="gradient"
        align="center"
        className="text-display-sm md:text-display-md mb-6"
      >
        {t("career.title")}
      </Text>
      <Text
        as="p"
        variant="sectionDescription"
        color="secondary"
        align="center"
        className="text-body-md lg:text-body-xl mb-12 md:mb-16 leading-relaxed max-w-section"
      >
        {t("career.description")}
      </Text>

      <ol className="flex w-full max-w-section flex-col">
        {entries.map((entry) => (
          <CareerEntry key={entry.company} {...entry} />
        ))}
      </ol>
    </section>
  );
};
