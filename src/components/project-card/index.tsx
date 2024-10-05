import ThumbTemp from "../../assets/thumb-temp.png";

export const ProjectCard: React.FC = () => {
  return (
    <div className="flex flex-col h-[532px] w-[583px] rounded-[20px] shadow-lg bg-white">
      <div className="flex flex-col justify-center">
        <img
          className="object-cover h-[389px] w-full rounded-t-[20px]"
          src={ThumbTemp}
        />
      </div>
      <div className="py-8 px-14 flex flex-col gap-2">
        <p className="font-poppins font-medium text-xl text-[#000000]">
          Creativa - Elementor Template Kit
        </p>
        <p className="font-poppins font-medium text-base text-[#5F5F5F]">
          UI/UX Design
        </p>
      </div>
    </div>
  );
};
