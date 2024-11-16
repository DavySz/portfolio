import { ProjectCardProps } from "./types";

export const ProjectCard: React.FC<ProjectCardProps> = ({
  category,
  thumb,
  title,
  link,
}) => {
  const openLink = (): void => {
    window.open(link, "_blank");
  };

  return (
    <div
      className="flex flex-col w-full rounded-[20px] shadow-lg bg-white hover:cursor-pointer"
      onClick={openLink}
    >
      <div className="flex flex-col justify-center">
        <img
          className="object-cover h-[389px] w-full rounded-t-[20px]"
          src={thumb}
        />
      </div>
      <div className="py-8 px-14 flex flex-col gap-2">
        <p className="font-poppins font-medium text-xl text-[#000000]">
          {title}
        </p>
        <p className="font-poppins font-medium text-base text-[#5F5F5F]">
          {category}
        </p>
      </div>
    </div>
  );
};
