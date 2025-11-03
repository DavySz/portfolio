import { SkeletonLoader } from "../skeleton-loader";

export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full min-h-[400px] md:min-h-[500px] rounded-[20px] shadow-lg bg-white animate-pulse">
      <div className="flex flex-col justify-center">
        <SkeletonLoader
          className="h-[200px] md:h-[389px] w-full rounded-t-[20px]"
          variant="rectangular"
        />
      </div>

      <div className="flex-1 py-4 md:py-8 px-4 md:px-14 flex flex-col justify-between gap-2">
        <div className="flex flex-col gap-2">
          <SkeletonLoader className="h-6 w-4/5" variant="text" />
          <SkeletonLoader className="h-4 w-1/2" variant="text" />
        </div>
      </div>
    </div>
  );
};
