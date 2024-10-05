import { ProjectCard } from "../../../components/project-card";

export const Projects: React.FC = () => {
  return (
    <div className="px-[100px] flex flex-col items-center justify-center mb-[112px]">
      <h1 className="font-poppins font-bold text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        Selected Projects
      </h1>
      <p className="font-poppins font-normal text-xl text-[#5F5F5F] text-center w-[764px] mb-16">
        I turn your idea, and thus your dream, into a unique project that
        inspires you and your client.
      </p>
      <div className="flex gap-6 flex-wrap items-center justify-center">
        {[1, 2, 3, 4].map(() => (
          <ProjectCard />
        ))}
      </div>
    </div>
  );
};
