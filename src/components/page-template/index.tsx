import { NavigationBar } from "../navigation-bar";
import { PageTemplateProps } from "./types";

export const PageTemplate: React.FC<PageTemplateProps> = ({ children }) => {
  return (
    <div className="flex flex-col w-full h-full">
      <NavigationBar />
      <div>{children}</div>
    </div>
  );
};
