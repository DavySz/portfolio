import { MdOutlineFileDownload } from "react-icons/md";
import { usePDF } from "../../../hooks/usePdf/use-pdf";
import { PT_CV_PATH, EN_CV_PATH } from "../../../shared/constants";
import { useTranslation } from "react-i18next";
import { useExperienceSection } from "../../../hooks/useExperienceSection/use-experience-section";
import { Button } from "../../../components/button";
import { Text } from "../../../components/text";

export const Self: React.FC = () => {
  const { t, i18n } = useTranslation("home");
  const sectionRef = useExperienceSection("self");
  const { download } = usePDF();

  const handleDownLoadCV = (): void => {
    download(i18n.language === "pt" ? PT_CV_PATH : EN_CV_PATH);
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex flex-col lg:flex-row w-full gap-6 xl:gap-24 items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
      id="self"
    >
      {/* Espaço da cena 3D: o canvas é global e fica atrás da seção, então
          aqui basta reservar a área. Abaixo de lg a cena não é desenhada e
          este bloco some, em vez de deixar um vazio. */}
      <div
        className="hidden lg:block h-[420px] w-full max-w-[520px] shrink-0"
        aria-hidden="true"
      />
      <div className="flex flex-col items-center justify-center lg:items-start max-w-[579px]">
        <Text
          as="h2"
          variant="sectionTitle"
          color="gradient"
          align="center"
          className="lg:text-left text-display-sm md:text-display-md mb-6"
        >
          {t("self.title")}
        </Text>

        <Text
          as="p"
          variant="sectionDescription"
          color="secondary"
          align="center"
          className="lg:text-left text-body-md md:text-body-xl mb-10 leading-relaxed"
        >
          {t("self.description")}
        </Text>

        <Button
          variant="secondary"
          icon={MdOutlineFileDownload}
          onClick={handleDownLoadCV}
        >
          {t("self.download")}
        </Button>
      </div>
    </section>
  );
};
