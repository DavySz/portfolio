import { MdOutlineFileDownload } from "react-icons/md";
import { SOCIALS } from "./constants";
import { usePDF } from "../../../hooks/usePdf/use-pdf";
import { CV_PATH } from "../../../shared/constants";
import { Button } from "../../../components/button";
import { Text } from "../../../components/text";
import UserPhoto from "../../../assets/user.png";
import { useTranslation } from "react-i18next";

export const Hero: React.FC = () => {
  const { t } = useTranslation("home");
  const { download } = usePDF();

  const openLink = (href: string): void => {
    window.open(href, "_blank");
  };

  const handleDownLoadCV = (): void => {
    download(CV_PATH);
  };

  return (
    <section className="flex flex-col-reverse xl:flex-row w-full gap-16 items-center justify-center py-12 md:py-16 px-6 xl:px-[100px]">
      <div className="flex flex-col items-center xl:items-start animate-fade-in-left">
        <Text
          as="p"
          variant="cardDescription"
          color="accent"
          align="center"
          className="xl:text-left text-display-sm md:text-heading-xl mb-6 animate-fade-in-up font-semibold tracking-wide uppercase"
        >
          {t("hero.me")}
        </Text>

        <div className="xl:w-[610px] mb-9">
          <Text
            as="h1"
            variant="heroTitle"
            color="gradient"
            align="center"
            className="xl:text-left text-display-md md:text-display-xl animate-gradient animate-fade-in-up"
          >
            {t("hero.role")}
          </Text>
        </div>

        <div className="xl:w-[518px] mb-10">
          <Text
            as="p"
            variant="heroSubtitle"
            color="secondary"
            align="center"
            className="xl:text-left text-body-lg md:text-body-xl animate-fade-in-up"
          >
            {t("hero.description")}
          </Text>
        </div>

        <div className="flex flex-col items-center gap-4 xl:flex-row xl:gap-7 animate-fade-in-up">
          <Button
            icon={MdOutlineFileDownload}
            onClick={handleDownLoadCV}
            variant="secondary"
          >
            {t("hero.download")}
          </Button>
          <div className="flex gap-4 xl:gap-5 items-center">
            {SOCIALS.map((social, index) => (
              <Button
                onClick={() => openLink(social.href)}
                variant="secondary"
                icon={social.icon}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="h-[300px] xl:h-[500px] w-screen xl:w-[500px] xl:rounded-3xl overflow-hidden animate-fade-in-right">
        <img
          className="object-cover h-full w-full animate-float"
          src={UserPhoto}
        />
      </div>
    </section>
  );
};
