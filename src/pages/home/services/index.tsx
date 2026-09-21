import { useTranslation } from "react-i18next";
import { useExperienceSection } from "../../../hooks/useExperienceSection/use-experience-section";
import { ServiceCards } from "../../../components/service-cards";
import { ServiceTable } from "../../../components/service-table";
import { Text } from "../../../components/text";
import { getServices } from "./constants";

export const Services: React.FC = () => {
  const { t } = useTranslation("home");
  const sectionRef = useExperienceSection("services");

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative isolate flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
    >
      {/* O fundo sai do CSS e passa a ser pintado pelo canvas, na mesma cor.
          Este elemento é o fallback: mantém a seção idêntica sem WebGL e se
          apaga quando o experience assume. */}
      <div
        className="absolute inset-0 -z-10 bg-secondary-50 experience-fallback"
        aria-hidden="true"
      />
      <Text
        as="h2"
        variant="sectionTitle"
        color="gradient"
        align="center"
        className="text-display-sm md:text-display-md mb-6"
      >
        {t("services.title")}
      </Text>
      <Text
        as="p"
        variant="sectionDescription"
        color="secondary"
        align="center"
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed max-w-section"
      >
        {t("services.description")}
      </Text>
      <div className="hidden md:flex">
        <ServiceTable data={getServices(t)} />
      </div>
      <div className="md:hidden">
        <ServiceCards data={getServices(t)} />
      </div>
    </section>
  );
};
