import { lazy, Suspense } from "react";
import { PageTemplate } from "./components/page-template";
import { Home } from "./pages/home";
import { useLog } from "./hooks";
import {
  redirectLegacyHash,
  useAnchorScroll,
  useArticleRoute,
} from "./hooks/useRoute/use-route";
import { Loading } from "./components/loading";
import {
  WELCOME_LOG_MESSAGE,
  WELCOME_LOG_MESSAGE_STYLES,
} from "./shared/constants";

// O leitor de artigos só é baixado quando alguém abre um artigo.
const ArticlePage = lazy(() =>
  import("./pages/article").then((module) => ({ default: module.ArticlePage }))
);

/* Antes do primeiro render: um link antigo `#/artigos/<slug>` vira o caminho
   equivalente, senão a rota leria a home e o artigo nem chegaria a montar.
   Ver `redirectLegacyHash` — este código é permanente. */
redirectLegacyHash();

function Entry() {
  const { slug, heading } = useArticleRoute();

  // Só na home: é lá que as âncoras do menu existem, e elas chegam tarde
  // porque as seções são lazy.
  useAnchorScroll(!slug);

  useLog({
    styles: WELCOME_LOG_MESSAGE_STYLES,
    text: WELCOME_LOG_MESSAGE,
  });

  return (
    <PageTemplate>
      {slug ? (
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loading size="lg" />
            </div>
          }
        >
          <ArticlePage slug={slug} heading={heading} />
        </Suspense>
      ) : (
        <Home />
      )}
    </PageTemplate>
  );
}

export default Entry;
