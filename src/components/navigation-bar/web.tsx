import { CONTACTS } from "../../shared/constants";
import { Button } from "../button";
import { Link } from "../link";
import { LINKS } from "./constants";

export const WebNavigationBar: React.FC = () => {
  const openLinkedin = () => {
    window.open(CONTACTS.LINKEDIN, "_blank");
  };

  return (
    <div className="flex gap-8 w-full items-center xl:justify-end lg:justify-center py-8 mb-8 md:px-[24px] mb:px-[100px] xl:px-[100px]">
      {LINKS.map((link, index) => (
        <Link href={link.href} key={index}>
          {link.label}
        </Link>
      ))}
      <Button onClick={openLinkedin}>Hire Me!</Button>
    </div>
  );
};
