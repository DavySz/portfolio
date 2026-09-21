import { MdOutlineFileDownload } from "react-icons/md";
import { SOCIALS } from "./constants";
import { usePDF } from "../../../hooks/usePdf/use-pdf";
import { EN_CV_PATH, PT_CV_PATH } from "../../../shared/constants";
import { Button } from "../../../components/button";
import { Text } from "../../../components/text";
import { useExperienceSection } from "../../../hooks/useExperienceSection/use-experience-section";
import UserPhoto from "../../../assets/user.webp";
import UserPhotoHalf from "../../../assets/user@half.webp";
import { ResponsiveImage } from "../../../components/responsive-image";
import { useTranslation } from "react-i18next";


export const Hero: React.FC = () => {
  const { t, i18n } = useTranslation("home");
  const { t: tc } = useTranslation("component");
  const sectionRef = useExperienceSection("hero");
  const { download } = usePDF();

  const openLink = (href: string): void => {
    window.open(href, "_blank");
  };

  const handleDownLoadCV = (): void => {
    download(i18n.language === "pt" ? PT_CV_PATH : EN_CV_PATH);
  };

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex flex-col-reverse xl:flex-row w-full gap-16 items-center justify-center pb-12 md:pb-16 xl:py-16 px-6 xl:px-[100px]"
    >
      {/* Fallback do canvas: é o que aparece sem WebGL, no tier "off" e até o
          experience assumir. O canvas em si é global (ExperienceRoot). */}
      <div
        className="absolute inset-0 -z-10 overflow-hidden experience-fallback experience-fallback-hero"
        data-no-physics
        aria-hidden="true"
      />
      <div className="flex flex-col items-center xl:items-start animate-fade-in-left">
        <Text
          as="p"
          variant="cardDescription"
          color="accentLight"
          align="center"
          className="xl:text-left text-display-sm md:text-heading-xl mb-6 animate-fade-in-up font-semibold tracking-wide uppercase"
        >
          {t("hero.me")}
        </Text>

        <div className="xl:w-[610px] mb-9">
          <Text
            as="h1"
            variant="heroTitle"
            color="gradientLight"
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
            color="white"
            align="center"
            className="xl:text-left text-body-lg md:text-body-xl animate-fade-in-up"
          >
            {t("hero.description")}
          </Text>
        </div>

        <div
          className="flex flex-col items-center gap-4 xl:flex-row xl:gap-7 animate-fade-in-up"
        >
          <Button
            icon={MdOutlineFileDownload}
            onClick={handleDownLoadCV}
            variant="onDark"
          >
            {t("hero.download")}
          </Button>
          <div className="flex gap-4 xl:gap-5 items-center">
            {SOCIALS.map((social) => (
              <Button
                onClick={() => openLink(social.href)}
                variant="onDark"
                icon={social.icon}
                aria-label={tc("a11y.openProfile", { network: social.name })}
                key={social.name}
              />
            ))}
          </div>
        </div>
      </div>
      <div
        className="h-[300px] xl:h-[500px] w-screen xl:w-[500px] xl:rounded-3xl overflow-hidden animate-fade-in-right"
      >
        {/* Elemento LCP da página: eager e com prioridade alta. O peso já
            caiu de 1.403 kB para 36 kB na otimização de imagens. */}
        <ResponsiveImage
          src={UserPhoto}
          half={UserPhotoHalf}
          width={1000}
          alt="Davy de Souza Assunção - Frontend Engineer"
          sizes="(min-width: 1280px) 500px, 100vw"
          priority
          className="h-full w-full animate-float object-cover"
        />
      </div>
    </section>
  );
};
