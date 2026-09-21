import { MdOutlineMailOutline } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { getLinks, SOCIALS } from "./constants";
import { Link } from "../../../components/link";
import { Text } from "../../../components/text";
import { CONTACTS } from "../../../shared/constants";
import { Button } from "../../../components/button";
import { useTranslation } from "react-i18next";
import { useGravityMode } from "../../../hooks/useGravityMode/use-gravity-mode";

export const Footer: React.FC = () => {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("component");
  const gravity = useGravityMode();

  const openLink = (link: string): void => {
    window.open(link, "_blank");
  };

  return (
    <footer className="py-16 md:py-24 px-6 xl:px-[100px] flex flex-col justify-center bg-secondary-900">
      <div className="flex flex-col md:flex-row justify-between pb-16 gap-6 md:gap-0">
        <div className="max-w-[500px]">
          <Text
            as="p"
            variant="bodyText"
            color="white"
            className="text-body-sm md:text-body-md leading-relaxed"
          >
            {t("footer.description")}
          </Text>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex gap-5 items-center">
            <MdOutlineMailOutline size={20} color="#ffff" />
            <Text
              as="span"
              variant="bodyText"
              color="white"
              className="text-body-md"
            >
              {CONTACTS.GMAIL}
            </Text>
          </div>
          <div className="flex gap-5 items-center">
            <LuPhone size={20} color="#ffff" />
            <Text
              as="span"
              variant="bodyText"
              color="white"
              className="text-body-md"
            >
              {CONTACTS.PHONE}
            </Text>
          </div>
          <div className="flex gap-5 items-center">
            {SOCIALS.map((social, index) => (
              <Button
                onClick={() => openLink(social.href)}
                variant="tertiary"
                icon={social.icon}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="w-full h-[0.5px] bg-white mb-12" />
      <div className="flex items-center justify-between flex-wrap gap-8">
        <div className="flex gap-8 flex-wrap">
          {getLinks(t).map((link, index) => (
            <Link href={link.href} key={index} variant="secondary">
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-6">
          {/* Discreto, não escondido: é um botão de verdade, alcançável por
              teclado e anunciado por leitor de tela. Some com reduced motion. */}
          {gravity.available && (
            <button
              type="button"
              onClick={gravity.toggle}
              className="font-poppins text-base font-normal text-[#5F5F5F] underline decoration-dotted underline-offset-4
                         transition-colors duration-300 hover:text-primary-300
                         focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 focus:ring-offset-secondary-900"
            >
              {tc("gravity.enable")}
            </button>
          )}
          <span className="text-base font-normal font-poppins text-[#5F5F5F]">
            {t("footer.copyright")}
          </span>
        </div>
      </div>
    </footer>
  );
};
