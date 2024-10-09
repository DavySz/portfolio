import { MdOutlineMailOutline } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { LINKS, SOCIALS } from "./constants";
import { Link } from "../../../components/link";
import { CONTACTS } from "../../../shared/constants";
import { Button } from "../../../components/button";

export const Footer: React.FC = () => {
  const openLink = (link: string) => {
    window.open(link, "_blank");
  };

  return (
    <footer className="px-[320px] py-[50px] flex flex-col justify-center bg-[#2A1454]">
      <div className="flex justify-between pb-16">
        <div className="w-[500px]">
          <p className="font-poppins font-normal text-base text-white">
            Welcome to my personal portfolio! I'm a software developer
            passionate about delivering creative and innovative solutions across
            various domains of development. Explore my projects to see how I
            bring ideas to life through code.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex gap-5 items-center">
            <MdOutlineMailOutline size={20} color="#ffff" />
            <span className="font-poppins font-normal text-base text-white">
              {CONTACTS.GMAIL}
            </span>
          </div>
          <div className="flex gap-5 items-center">
            <LuPhone size={20} color="#ffff" />
            <span className="font-poppins font-normal text-base text-white">
              {CONTACTS.PHONE}
            </span>
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
      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          {LINKS.map((link, index) => (
            <Link href={link.href} key={index} variant="secondary">
              {link.label}
            </Link>
          ))}
        </div>
        <span className="text-base font-normal font-poppins text-[#5F5F5F]">
          © All Right Reserved
        </span>
      </div>
    </footer>
  );
};
