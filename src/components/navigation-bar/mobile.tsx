import { useCallback, useEffect, useState } from "react";
import { CONTACTS } from "../../shared/constants";
import { Button } from "../button";
import { Link } from "../link";
import { Toggle } from "../toogle";
import { getLinks } from "./constants";
import { FiMenu } from "react-icons/fi";
import { IconType } from "react-icons";
import { AiOutlineClose } from "react-icons/ai";
import clsx from "clsx";
import { useTranslation } from "react-i18next";

export const MobileNavigationBar: React.FC = () => {
  const { t } = useTranslation("component");
  const [isVisible, setIsVisible] = useState(false);

  const toggleOptions = (): void => {
    setIsVisible((prev) => !prev);
  };

  const openLinkedin = () => {
    window.open(CONTACTS.LINKEDIN, "_blank");
  };

  const getIcon = (): IconType => {
    return isVisible ? AiOutlineClose : FiMenu;
  };

  const handleSelectOption = (): void => {
    toggleOptions();
  };

  const disableScrollY = useCallback((): void => {
    if (isVisible) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
      document.body.style.height = "100%";
      document.body.style.touchAction = "none";
    } else {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
      document.body.style.position = "static";
      document.body.style.width = "auto";
      document.body.style.height = "auto";
      document.body.style.touchAction = "auto";
    }
  }, [isVisible]);

  const enableScrollY = () => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
    document.body.style.position = "static";
    document.body.style.width = "auto";
    document.body.style.height = "auto";
    document.body.style.touchAction = "auto";
  };

  useEffect(() => {
    disableScrollY();
    return enableScrollY;
  }, [disableScrollY]);

  return (
    <div
      className={clsx(
        "flex flex-col gap-8 w-full items-end justify-center py-4 xl:px-[100px] px-6",
        {
          "h-screen": isVisible,
        }
      )}
    >
      <div className="flex items-center justify-between gap-4 w-full">
        <Toggle />
        <Button variant="secondary" icon={getIcon()} onClick={toggleOptions} />
      </div>
      {isVisible && (
        <div className="flex flex-col w-full h-screen gap-12">
          {getLinks(t).map((link, index) => (
            <Link href={link.href} key={index} onClick={handleSelectOption}>
              {link.label}
            </Link>
          ))}
          <Button onClick={openLinkedin}>{t("navigation-bar.hire-me")}</Button>
        </div>
      )}
    </div>
  );
};
