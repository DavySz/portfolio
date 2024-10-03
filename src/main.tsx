import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ApplicationEntry from "./entry.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ApplicationEntry />
  </StrictMode>
);
