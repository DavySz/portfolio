import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ApplicationEntry from "./entry.tsx";
import { registerServiceWorker } from "./serviceWorkerRegistration";
import "./i18n/index.ts";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApplicationEntry />
  </StrictMode>
);

// Register service worker for PWA capabilities
registerServiceWorker();
