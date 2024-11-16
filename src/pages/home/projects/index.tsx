import { ProjectCard } from "../../../components/project-card";
import { PROJECTS } from "./constants";

export const Projects: React.FC = () => {
  return (
    <div
      id="projects"
      className="px-[230px] flex flex-col items-center justify-center mb-[112px] pt-[112px]"
    >
      <h1 className="font-poppins font-bold text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        Selected Projects
      </h1>
      <p className="font-poppins font-normal text-xl text-[#5F5F5F] text-center w-[764px] mb-16">
        I turn your idea, and thus your dream, into a unique project that
        inspires you and your client.
      </p>
      <div className="grid gap-6 justify-center grid-cols-2">
        {PROJECTS.map((project, index) => (
          <ProjectCard {...project} key={index} />
        ))}
      </div>
    </div>
  );
};
