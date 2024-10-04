import { MdOutlineFileDownload } from "react-icons/md";
import { SOCIALS } from "./constants";
import HeroTemp from "../../../assets/hero-temp.svg";

export const Hero: React.FC = () => {
  return (
    <div className="flex w-full gap-16 items-center justify-center mb-14 px-[100px]">
      <div className="flex flex-col">
        <p className="font-poppins font-semibold text-[#2A1454] text-2xl mb-6">
          I am Davy
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
        <div className="flex">
          <button className="flex gap-2 py-2 px-8 rounded-3xl bg-transparent items-center justify-center border border-[#7544D7] mr-7">
            <p className="font-poppins font-semibold text-[#7041CF] text-xl">
              Dowload CV
            </p>
            <MdOutlineFileDownload size={24} color="#7041CF" />
          </button>
          <div className="flex gap-5 items-center">
            {SOCIALS.map((social, index) => (
              <button
                className="flex p-4 rounded-full bg-transparent items-center justify-center border border-[#7544D7]"
                key={index}
              >
                {social.icon}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div>
        <img src={HeroTemp} />
      </div>
    </div>
  );
};
