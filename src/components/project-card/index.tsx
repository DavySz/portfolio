import { ProjectCardProps } from "./types";
import { Text } from "../text";

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
      className="group flex flex-col w-full h-full min-h-[400px] md:min-h-[500px] rounded-[20px] shadow-lg bg-white hover:cursor-pointer
                 transition-all duration-300 ease-out
                 hover:shadow-xl hover:shadow-primary-500/10 hover:-translate-y-2
                 transform active:scale-95 animate-fade-in-up
                 relative overflow-hidden"
      onClick={openLink}
    >
      <div
        className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out
                      rounded-[20px] z-10"
      />

      <div className="flex flex-col justify-center relative">
        <img
          className="object-cover h-[200px] md:h-[389px] w-full rounded-t-[20px]
                     transition-transform duration-300 ease-out group-hover:scale-105"
          src={thumb}
        />

        <div
          className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100
                        transition-opacity duration-300 ease-out rounded-t-[20px]
                        flex items-center justify-center"
        >
          <div
            className="bg-white/90 backdrop-blur-sm rounded-full p-3
                          transform scale-0 group-hover:scale-100 transition-transform duration-300 ease-out"
          >
            <svg
              className="w-6 h-6 text-primary-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex-1 py-4 md:py-8 px-4 md:px-14 flex flex-col justify-between gap-2 relative z-20">
        <div className="flex flex-col gap-2">
          <Text
            as="p"
            variant="cardTitle"
            color="primary"
            className="text-heading-md md:text-heading-xl group-hover:text-primary-700 transition-colors duration-300 leading-snug"
          >
            {title}
          </Text>
          <Text
            as="p"
            variant="cardDescription"
            color="muted"
            className="text-body-md group-hover:text-primary-600 transition-colors duration-300"
          >
            {category}
          </Text>
        </div>
      </div>
    </div>
  );
};
