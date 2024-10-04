export const Contact: React.FC = () => {
  return (
    <div className="flex flex-col px-[100px] items-center justify-center bg-[#F6F3FC] py-[94px]">
      <div className="flex flex-col justify-center w-[545px] rounded-[20px] bg-white p-[34px] pb-[47px]">
        <h1 className="font-poppins font-bold text-4xl bg-gradient-to-tr from-[#7947DF] to-[#311961] bg-clip-text text-transparent mb-4">
          Let's work together!
        </h1>
        <p className="font-poppins font-normal text-xl text-[#000000] text-start w-full pb-9">
          I create clean and elegant code for beautifully simple solutions, and
          I'm passionate about what I do. It's as simple as that!
        </p>
        <form className="flex flex-col items-start gap-5">
          <input
            className="w-full p-4 bg-[#F6F3FC] rounded-lg placeholder-[#5F5F5F] placeholder:font-poppins"
            placeholder="Your name"
            type="text"
          />
          <input
            className="w-full p-4 bg-[#F6F3FC] rounded-lg placeholder-[#5F5F5F] placeholder:font-poppins"
            placeholder="Your email"
            type="email"
          />
          <textarea
            className="w-full p-4 bg-[#F6F3FC] rounded-lg placeholder-[#5F5F5F] placeholder:font-poppins"
            style={{ resize: "none" }}
            placeholder="Message"
            rows={5}
          />
          <button className="py-2 px-8 rounded-3xl bg-gradient-to-r from-[#7947DF] to-[#311961] items-center justify-center mt-[14px]">
            <p className="font-poppins font-semibold text-white text-xl">
              Send Massage
            </p>
          </button>
        </form>
      </div>
    </div>
  );
};
