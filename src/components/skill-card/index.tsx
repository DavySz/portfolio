import { SkillCardProps } from "./types";

export const SkillCard: React.FC<SkillCardProps> = ({ data, onClick }) => {
  return (
    <div
      className="group cursor-pointer flex flex-col items-center justify-center transition-all duration-300 ease-out
                 hover:scale-105 animate-fade-in-up"
      onClick={onClick}
      style={{
        animationDelay: `${Math.random() * 0.5}s`,
      }}
    >
      <div
        className="bg-secondary-50 rounded-[30px] h-[150px] w-[150px] flex flex-col items-center justify-center mb-5 
                      transition-all duration-300 ease-out
                      group-hover:bg-secondary-900 group-hover:-translate-y-3 group-hover:shadow-xl group-hover:shadow-primary-500/20
                      group-hover:animate-pulse-soft transform group-active:scale-95
                      relative overflow-hidden"
      >
        {/* Background glow effect */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-[30px] 
                        opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-out"
        />

        <div className="relative z-10 transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-12">
          {data.icon}
        </div>
      </div>
      <p
        className="font-poppins font-normal text-primary-500 text-xl transition-all duration-300 ease-out
                    group-hover:text-primary-600 group-hover:font-semibold"
      >
        {data.title}
      </p>
    </div>
  );
};
