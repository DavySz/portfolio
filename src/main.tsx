import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ApplicationEntry from "./entry.tsx";
import { registerServiceWorker } from "./serviceWorkerRegistration";
import { ensureInitialLanguage } from "./i18n";
import "./index.css";

// Em inglês isto resolve sem rede, então não adia nada. Em português espera a
// tradução chegar — é o que evita a tela piscar de um idioma para o outro.
void ensureInitialLanguage().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ApplicationEntry />
    </StrictMode>
  );
});

// Register service worker for PWA capabilities
registerServiceWorker();
