import { memo } from "react";
import { NavigationBar } from "../navigation-bar";
import type { PageTemplateProps } from "./types";

export const PageTemplate: React.FC<PageTemplateProps> = memo(
  ({ children }) => {
    return (
      <div className="flex flex-col w-full h-full">
        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-4 focus:bg-primary-600 focus:text-white"
        >
          Pular para o conteúdo principal
        </a>
        <NavigationBar />
        <main id="main-content" role="main">
          {children}
        </main>
      </div>
    );
  },
);
