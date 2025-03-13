import { MdOutlineFileDownload } from "react-icons/md";
import SelfTemp from "../../../assets/my-temp.svg";
import { usePDF } from "../../../hooks/use-pdf";
import { CV_PATH } from "../../../shared/constants";

export const Self: React.FC = () => {
  const { download } = usePDF();

  const handleDownLoadCV = (): void => {
    download(CV_PATH);
  };

  return (
    <section
      className="flex flex-col lg:flex-row w-full gap-6 xl:gap-24 items-center justify-center mb-[100px] md:mb-[158px] px-6 xl:px-[100px] pt-[100px] md:pt-[179px]"
      id="self"
    >
      <div className="hidden lg:flex">
        <img src={SelfTemp} />
      </div>
      <div className="flex flex-col items-center justify-center lg:items-start max-w-[579px]">
        <h1 className="font-poppins font-bold text-3xl md:text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
          About Myself
        </h1>
        <p className="text-center lg:text-start font-poppins font-normal text-base md:text-xl text-[#5F5F5F] mb-10">
          With extensive experience and expertise in various software
          development technologies, I have collaborated with a range of clients
          to create efficient and innovative digital solutions. I invite you to
          explore this portfolio and discover how I can help turn your ideas
          into reality through high-quality code.
        </p>
        <button
          className="flex gap-2 py-2 px-8 rounded-3xl bg-transparent items-center justify-center border border-[#7544D7] mr-7"
          onClick={handleDownLoadCV}
        >
          <p className="font-poppins font-semibold text-[#7041CF] text-xl">
            Dowload CV
          </p>
          <MdOutlineFileDownload size={24} color="#7041CF" />
        </button>
      </div>
    </section>
  );
};
