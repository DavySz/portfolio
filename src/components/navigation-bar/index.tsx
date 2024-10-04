import { LINKS } from "./constants";

export const NavigationBar: React.FC = () => {
  return (
    <div className="flex gap-8 w-full items-center justify-end py-8 px-[100px]">
      {LINKS.map((link, index) => (
        <a href={link.href} key={index}>
          {link.label}
        </a>
      ))}
      <button className="py-2 px-8 rounded-3xl bg-gradient-to-r from-[#7947DF] to-[#311961] items-center justify-center">
        <p className="font-poppins font-semibold text-white text-xl">
          Hire Me!
        </p>
      </button>
    </div>
  );
};
