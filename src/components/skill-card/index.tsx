import type { SkillCardProps } from "./types";

export const SkillCard: React.FC<SkillCardProps> = ({ data }) => {
  return (
    /* Link de verdade em vez de div com onClick: alcançável por teclado,
       anunciado como link e com "abrir em nova aba" funcionando. */
    <a
      href={data.link}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col items-center justify-center transition-all duration-300 ease-out
                 hover:scale-105
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-4 focus-visible:rounded-[30px]"
    >
      <div
        className="bg-surface rounded-[30px] h-[150px] w-[150px] flex flex-col items-center justify-center mb-5 
                      transition-all duration-300 ease-out
                      group-hover:bg-footer group-hover:-translate-y-3 group-hover:shadow-xl group-hover:shadow-primary-500/20
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
                    group-hover:text-accent group-hover:font-semibold"
      >
        {data.title}
      </p>
    </a>
  );
};
