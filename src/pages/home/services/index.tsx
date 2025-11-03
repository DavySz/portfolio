import { useTranslation } from "react-i18next";
import { ServiceCards } from "../../../components/service-cards";
import { ServiceTable } from "../../../components/service-table";
import { Text } from "../../../components/text";
import { getServices } from "./constants";

export const Services: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <section
      id="services"
      className="flex flex-col items-center justify-center bg-secondary-50 py-16 md:py-24 px-6 xl:px-[100px]"
    >
      <Text
        as="h1"
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
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed"
        maxWidth="764px"
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
