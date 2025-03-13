import { useCallback, useEffect, useState } from "react";
import { CONTACTS } from "../../shared/constants";
import { Button } from "../button";
import { Link } from "../link";
import { LINKS } from "./constants";
import { FiMenu } from "react-icons/fi";
import { IconType } from "react-icons";
import { AiOutlineClose } from "react-icons/ai";
import clsx from "clsx";

export const MobileNavigationBar: React.FC = () => {
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
    } else {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    }
  }, [isVisible]);

  const enableScrollY = () => {
    document.documentElement.style.overflow = "auto";
    document.body.style.overflow = "auto";
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
      <Button variant="secondary" icon={getIcon()} onClick={toggleOptions} />
      {isVisible && (
        <div className="flex flex-col w-full h-screen gap-12">
          {LINKS.map((link, index) => (
            <Link href={link.href} key={index} onClick={handleSelectOption}>
              {link.label}
            </Link>
          ))}
          <Button onClick={openLinkedin}>Hire me!</Button>
        </div>
      )}
    </div>
  );
};
