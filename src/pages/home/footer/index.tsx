import { MdOutlineMailOutline } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { FaGithubAlt, FaLinkedin } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

export const Footer: React.FC = () => {
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
              davydesouzabar@gmail.com
            </span>
          </div>
          <div className="flex gap-5 items-center">
            <LuPhone size={20} color="#ffff" />
            <span className="font-poppins font-normal text-base text-white">
              (92) 992939794
            </span>
          </div>
          <div className="flex gap-5 items-center">
            <FaGithubAlt size={24} color="#ffff" />
            <FaLinkedin size={24} color="#ffff" />
            <FaInstagram size={24} color="#ffff" />
          </div>
        </div>
      </div>
      <div className="w-full h-[0.5px] bg-white mb-12" />
      <div className="flex items-center justify-between">
        <div className="flex gap-8">
          <span className="uppercase font-normal text-white text-base font-poppins">
            home
          </span>
          <span className="uppercase font-normal text-white text-base font-poppins">
            statistics
          </span>
          <span className="uppercase font-normal text-white text-base font-poppins">
            about me
          </span>
          <span className="uppercase font-normal text-white text-base font-poppins">
            services
          </span>
          <span className="uppercase font-normal text-white text-base font-poppins">
            skills
          </span>
          <span className="uppercase font-normal text-white text-base font-poppins">
            work together
          </span>
          <span className="uppercase font-normal text-white text-base font-poppins">
            projects
          </span>
        </div>
        <span className="text-base font-normal font-poppins text-[#5F5F5F]">
          © All Right Reserved
        </span>
      </div>
    </footer>
  );
};
