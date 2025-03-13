import { ReactNode } from "react";
import { STATISTICS } from "./constants";

export const Statistics: React.FC = () => {
  const renderStatistics = (): ReactNode[] => {
    return STATISTICS.map((statistic, index) => (
      <div
        className="flex items-center justify-center max-w-[140px] xl:max-w-[160px] gap-1 xl:gap-2"
        key={index}
      >
        <p className="font-poppins font-bold text-3xl md:text-6xl text-[#7041CF]">
          {statistic.value}
        </p>
        <p className="text-center xl:text-start font-poppins font-normal text-[#5F5F5F] text-sm md:text-base">
          {statistic.title}
        </p>
      </div>
    ));
  };

  return (
    <section className="flex items-center justify-center px-6 xl:mx-[205px]">
      <div className="flex items-center justify-between md:justify-center flex-wrap gap-[8px] md:gap-[80px] xl:gap-[102px]">
        {renderStatistics()}
      </div>
    </section>
  );
};
