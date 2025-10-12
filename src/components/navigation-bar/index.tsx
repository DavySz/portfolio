import { useMobile } from "../../hooks";
import { MobileNavigationBar } from "./mobile";
import { WebNavigationBar } from "./web";

export const NavigationBar: React.FC = () => {
  const { isMobile } = useMobile();
  return isMobile ? <MobileNavigationBar /> : <WebNavigationBar />;
};
