import { MdOutlineFileDownload } from "react-icons/md";
import { SOCIALS } from "./constants";
import { usePDF } from "../../../hooks/usePdf/use-pdf";
import { EN_CV_PATH, PT_CV_PATH } from "../../../shared/constants";
import { Button } from "../../../components/button";
import { Text } from "../../../components/text";
import { useExperienceSection } from "../../../hooks/useExperienceSection/use-experience-section";
import UserPhoto from "../../../assets/user.png";
import { useTranslation } from "react-i18next";

/**
 * O React 18 não reconhece a prop camelCase `fetchPriority` — só a 19 passa a
 * reconhecer. Os tipos do @types/react 18 já a declaram, então o typecheck
 * aprova e o aviso aparece só em runtime.
 *
 * Em minúsculas o React repassa o atributo direto para o DOM, que é o que o
 * navegador lê. Via spread porque o nome minúsculo não está nos tipos de <img>.
 */
const LCP_PRIORITY = { fetchpriority: "high" } as const;

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

        <div className="xl:w-[610px] mb-9" data-physics>
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

        <div className="xl:w-[518px] mb-10" data-physics>
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
          data-physics
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
        data-physics
      >
        {/* Elemento LCP da página. width/height reservam a caixa antes de a
            imagem chegar (evita CLS) e a prioridade tira ela da fila atrás
            dos outros recursos. O peso do arquivo continua sendo o gargalo —
            ver "Próximos passos" no REPORT. */}
        <img
          src={UserPhoto}
          alt="Davy de Souza Assunção - Full Stack Developer"
          width={1024}
          height={1024}
          decoding="async"
          {...LCP_PRIORITY}
          className="h-full w-full animate-float object-cover"
        />
      </div>
    </section>
  );
};
