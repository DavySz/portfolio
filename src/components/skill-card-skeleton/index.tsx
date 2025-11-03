import { SkeletonLoader } from "../skeleton-loader";

export const SkillCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center animate-pulse">
      <div className="bg-gray-200 rounded-[30px] h-[150px] w-[150px] flex flex-col items-center justify-center mb-5">
        <SkeletonLoader variant="circular" width={72} height={72} />
      </div>

      <SkeletonLoader className="h-6 w-20" variant="text" />
    </div>
  );
};
