import { MdOutlineFileDownload } from "react-icons/md";
import SelfTemp from "../../../assets/my-temp.svg";

export const Self: React.FC = () => {
  return (
    <div
      id="self"
      className="flex w-full gap-24 items-center justify-center mb-[158px] px-[100px] pt-[179px]"
    >
      <div>
        <img src={SelfTemp} />
      </div>
      <div className="w-[579px]">
        <h1 className="font-poppins font-bold text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
          About My Self
        </h1>
        <p className="font-poppins font-normal text-xl text-[#5F5F5F] mb-10">
          With extensive experience and expertise in various software
          development technologies, I have collaborated with a range of clients
          to create efficient and innovative digital solutions. I invite you to
          explore this portfolio and discover how I can help turn your ideas
          into reality through high-quality code.
        </p>
        <button className="flex gap-2 py-2 px-8 rounded-3xl bg-transparent items-center justify-center border border-[#7544D7] mr-7">
          <p className="font-poppins font-semibold text-[#7041CF] text-xl">
            Dowload CV
          </p>
          <MdOutlineFileDownload size={24} color="#7041CF" />
        </button>
      </div>
    </div>
  );
};
