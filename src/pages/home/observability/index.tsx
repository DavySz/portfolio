import { useTranslation } from "react-i18next";
import { Text } from "../../../components/text";
import { TraceWaterfall } from "../../../components/trace-waterfall";
import { SAMPLE_TRACE } from "./constants";

export const Observability: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <section
      id="observability"
      className="flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
    >
      <Text
        as="h1"
        variant="sectionTitle"
        color="gradient"
        align="center"
        className="text-display-sm md:text-display-md mb-6"
      >
        {t("observability.title")}
      </Text>
      <Text
        as="p"
        variant="sectionDescription"
        color="secondary"
        align="center"
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed"
        maxWidth="764px"
      >
        {t("observability.description")}
      </Text>

      <TraceWaterfall
        trace={SAMPLE_TRACE}
        summary={t("observability.summary")}
        labels={{ duration: t("observability.labels.duration") }}
      />

      <Text
        as="p"
        variant="cardDescription"
        color="subtle"
        align="center"
        className="text-body-sm mt-10"
        maxWidth="620px"
      >
        {t("observability.note")}
      </Text>
    </section>
  );
};
