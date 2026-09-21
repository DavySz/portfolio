import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaMedium } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { Text } from "../../components/text";
import { Button } from "../../components/button";
import { Loading } from "../../components/loading";
import { findArticle, loadArticleContent } from "../../content/articles";
import type { ArticlePageProps } from "./types";

interface Content {
  html: string;
  readingMinutes: number;
}

export const ArticlePage: React.FC<ArticlePageProps> = ({ slug }) => {
  const { t, i18n } = useTranslation("component");
  const meta = findArticle(slug);
  const [content, setContent] = useState<Content | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    // Trocar de artigo mantém a página montada: o scroll precisa voltar ao topo.
    window.scrollTo({ top: 0 });
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    setFailed(false);

    loadArticleContent(slug)
      .then((loaded) => {
        if (cancelled) return;
        if (loaded) setContent(loaded);
        else setFailed(true);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  /**
   * Acrescenta um botão de copiar à barra de cada bloco de código.
   *
   * O HTML do artigo é gerado no build e não passa pelo React, então o botão
   * é injetado aqui — depois que o conteúdo entra no DOM. Fica contido: tudo
   * que é criado é removido na limpeza do efeito.
   */
  useEffect(() => {
    if (!content) return;

    const blocks = [
      ...document.querySelectorAll<HTMLElement>(".article-code"),
    ];
    const cleanups: Array<() => void> = [];

    for (const block of blocks) {
      const bar = block.querySelector(".article-code-bar");
      const code = block.querySelector("code");
      if (!bar || !code) continue;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "article-code-copy";
      button.textContent = t("article.copy");

      let resetTimer = 0;
      const onClick = async () => {
        try {
          await navigator.clipboard.writeText(code.textContent ?? "");
          button.textContent = t("article.copied");
        } catch {
          button.textContent = t("article.copyFailed");
        }
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          button.textContent = t("article.copy");
        }, 2000);
      };

      button.addEventListener("click", onClick);
      bar.appendChild(button);

      cleanups.push(() => {
        window.clearTimeout(resetTimer);
        button.removeEventListener("click", onClick);
        button.remove();
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [content, t]);

  useEffect(() => {
    if (!meta) return;
    const previous = document.title;
    document.title = `${meta.title} | Davy de Souza Assunção`;
    return () => {
      document.title = previous;
    };
  }, [meta]);

  const goBack = () => {
    window.location.hash = "";
  };

  if (!meta || failed) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24">
        <Text as="h1" variant="sectionTitle" color="primary" align="center">
          {t("article.notFound")}
        </Text>
        <Button variant="secondary" icon={MdArrowBack} onClick={goBack}>
          {t("article.back")}
        </Button>
      </div>
    );
  }

  const published = new Intl.DateTimeFormat(i18n.language, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(meta.date));

  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 md:py-16">
      <div className="mb-10">
        <Button variant="tertiary" icon={MdArrowBack} onClick={goBack}>
          {t("article.back")}
        </Button>
      </div>

      <header className="mb-10 border-b border-gray-200 pb-8">
        <p className="mb-4 font-poppins text-body-sm uppercase tracking-wider text-primary-600">
          {meta.tag}
        </p>

        <Text
          as="h1"
          variant="heroTitle"
          color="primary"
          className="mb-4 text-display-sm md:text-display-md"
        >
          {meta.title}
        </Text>

        <Text
          as="p"
          variant="sectionDescription"
          color="secondary"
          className="mb-6 text-body-md md:text-body-lg"
        >
          {meta.excerpt}
        </Text>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 font-poppins text-body-sm text-gray-600">
          <time dateTime={meta.date}>{published}</time>
          {content && (
            <>
              <span aria-hidden="true">·</span>
              <span>
                {t("article.readingTime", { minutes: content.readingMinutes })}
              </span>
            </>
          )}
          {meta.mediumUrl && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={meta.mediumUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 text-primary-600 underline underline-offset-4
                           transition-colors duration-300 hover:text-primary-800
                           focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              >
                <FaMedium aria-hidden="true" />
                {t("article.readOnMedium")}
              </a>
            </>
          )}
        </div>
      </header>

      {content ? (
        <div
          /* Os artigos são escritos em português, mesmo com a interface em
             inglês: marcar o idioma aqui é o que faz leitor de tela e tradutor
             do navegador tratarem o texto corretamente. */
          lang="pt-BR"
          className="article-content"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loading size="lg" />
        </div>
      )}
    </article>
  );
};
