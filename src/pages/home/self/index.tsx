import { MdOutlineFileDownload } from "react-icons/md";
import SelfTemp from "../../../assets/portfolio.png";
import { usePDF } from "../../../hooks/usePdf/use-pdf";
import { PT_CV_PATH, EN_CV_PATH } from "../../../shared/constants";
import { useTranslation } from "react-i18next";
import { Button } from "../../../components/button";
import { Text } from "../../../components/text";

export const Self: React.FC = () => {
  const { t, i18n } = useTranslation("home");
  const { download } = usePDF();

  const handleDownLoadCV = (): void => {
    download(i18n.language === "pt" ? PT_CV_PATH : EN_CV_PATH);
  };

  return (
    <section
      className="flex flex-col lg:flex-row w-full gap-6 xl:gap-24 items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
      id="self"
    >
      <div className="h-[300px] xl:h-[500px] w-screen xl:w-[500px] xl:rounded-3xl overflow-hidden">
        <img
          src={SelfTemp}
          alt="Davy de Souza Assunção - Portfolio workspace"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col items-center justify-center lg:items-start max-w-[579px]">
        <Text
          as="h1"
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
          className="mr-7"
        >
          {t("self.download")}
        </Button>
      </div>
    </section>
  );
};
