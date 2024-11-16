import { MdOutlineFileDownload } from "react-icons/md";
import { SOCIALS } from "./constants";
import { usePDF } from "../../../hooks/use-pdf";
import { CV_PATH } from "../../../shared/constants";
import { Button } from "../../../components/button";
import UserPhoto from "../../../assets/user.jpeg";

export const Hero: React.FC = () => {
  const { download } = usePDF();

  const openLink = (href: string) => {
    window.open(href, "_blank");
  };

  const handleDownLoadCV = () => {
    download(CV_PATH);
  };

  return (
    <div className="flex w-full gap-16 items-center justify-center mb-14 px-[100px]">
      <div className="flex flex-col">
        <p className="font-poppins font-semibold text-[#2A1454] text-2xl mb-6">
          I am Davy de Souza Assunção
        </p>
        <div className="w-[610px] mb-9">
          <h1 className="font-poppins font-bold text-6xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent">
            Full Stack Software Developer
          </h1>
        </div>
        <div className="w-[518px] mb-10">
          <p className="font-poppins font-normal text-[#5F5F5F] text-xl">
            I love technology, coffee, and using my knowledge to solve problems
            and transform lives.
          </p>
        </div>
        <div className="flex gap-7">
          <Button
            icon={MdOutlineFileDownload}
            onClick={handleDownLoadCV}
            variant="secondary"
          >
            Dowload CV
          </Button>
          <div className="flex gap-5 items-center">
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
      <div className="h-[500px] w-[500px] rounded-3xl overflow-hidden">
        <img className="object-cover h-full w-full " src={UserPhoto} />
      </div>
    </div>
  );
};
