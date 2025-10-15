import { useTranslation } from "react-i18next";
import { ServiceCards } from "../../../components/service-cards";
import { ServiceTable } from "../../../components/service-table";
import { getServices } from "./constants";

export const Services: React.FC = () => {
  const { t } = useTranslation("home");

  return (
    <section
      id="services"
      className="flex flex-col items-center justify-center bg-[#F6F3FC] py-24 xl:px-[100px]"
    >
      <h1 className="text-center font-poppins font-bold text-3xl md:text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
        {t("services.title")}
      </h1>
      <p className="px-4 font-poppins font-normal text-base lg:text-xl text-[#5F5F5F] text-center max-w-[764px] mb-16">
        {t("services.description")}
      </p>
      <div className="hidden md:flex">
        <ServiceTable data={getServices(t)} />
      </div>
      <div className="md:hidden">
        <ServiceCards data={getServices(t)} />
      </div>
    </section>
  );
};
