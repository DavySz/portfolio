import { CONTACTS } from "../../shared/constants";
import { Button } from "../button";
import { Link } from "../link";
import { LINKS } from "./constants";

export const NavigationBar: React.FC = () => {
  const openLinkedin = () => {
    window.open(CONTACTS.LINKEDIN, "_blank");
  };

  return (
    <div className="flex gap-8 w-full items-center justify-end py-8 px-[100px]">
      {LINKS.map((link, index) => (
        <Link href={link.href} key={index}>
          {link.label}
        </Link>
      ))}
      <Button onClick={openLinkedin}>Hire Me!</Button>
    </div>
  );
};
