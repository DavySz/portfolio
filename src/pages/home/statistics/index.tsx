export const Statistics: React.FC = () => {
  const getYearsOfExperience = (): number => {
    const initial = new Date("2022-02-01");
    const current = new Date();
    const diff = current.getTime() - initial.getTime();
    const years = diff / (1000 * 60 * 60 * 24 * 365);
    return Math.round(years);
  };

  return (
    <div className="mx-[205px] items-center justify-center flex mb-[179px] px-[100px]">
      <div className="flex gap-[102px]">
        <div className="flex items-center justify-center w-[160px] gap-2">
          <p className="font-poppins font-bold text-6xl text-[#7041CF]">
            {getYearsOfExperience()}
          </p>
          <p className="font-poppins font-normal text-[#5F5F5F] text-base">
            Years of Experience
          </p>
        </div>
        <div className="flex items-center justify-center w-[160px] gap-2">
          <p className="font-poppins font-bold text-6xl text-[#7041CF]">50+</p>
          <p className="font-poppins font-normal text-[#5F5F5F] text-base">
            Project Completed
          </p>
        </div>
        <div className="flex items-center justify-center w-[160px] gap-2">
          <p className="font-poppins font-bold text-6xl text-[#7041CF]">1</p>
          <p className="font-poppins font-normal text-[#5F5F5F] text-base">
            Public Contributions
          </p>
        </div>
        <div className="flex items-center justify-center w-[160px] gap-2">
          <p className="font-poppins font-bold text-6xl text-[#7041CF]">
            {getYearsOfExperience()}
          </p>
          <p className="font-poppins font-normal text-[#5F5F5F] text-base">
            Years of Experience
          </p>
        </div>
      </div>
    </div>
  );
};
