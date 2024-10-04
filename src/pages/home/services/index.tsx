import { ServiceTable } from "../../../components/service-table";
import { SERVICES } from "./constants";

export const Services: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-[#F6F3FC] py-24 mb-[114px] px-[100px]">
      <h1 className="font-poppins font-bold text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        My Quality Services
      </h1>
      <p className="font-poppins font-normal text-xl text-[#5F5F5F] text-center w-[764px] mb-16">
        I turn your ideas and thus your wishes into a unique project that
        inspires you and your customers.
      </p>

      <div>
        <ServiceTable data={SERVICES} />
      </div>
    </div>
  );
};
