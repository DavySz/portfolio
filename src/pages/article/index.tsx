import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { FaMedium } from "react-icons/fa";
import { MdArrowBack } from "react-icons/md";
import { Text } from "../../components/text";
import { Button } from "../../components/button";
import { Loading } from "../../components/loading";
import { useSEO } from "../../hooks";
import type { Language } from "../../i18n";
import { articleHref, goToSection } from "../../hooks/useHashRoute/use-hash-route";
import { useReducedMotion } from "../../hooks/useReducedMotion/use-reduced-motion";
import { formatCatalogDate } from "../../shared/date";
import { ArticleToc } from "../../components/article-toc";
import { ReadingProgress } from "../../components/reading-progress";
import {
  findArticle,
  findNeighbours,
  loadArticleContent,
} from "../../content/articles";
import type { ArticleContent } from "../../content/articles";
import type { ArticlePageProps } from "./types";

const SITE = "https://davysz.com";
const AUTHOR = "Davy de Souza Assunção";

export const ArticlePage: React.FC<ArticlePageProps> = ({ slug, heading }) => {
  const { t, i18n } = useTranslation("component");
  const language: Language = i18n.language === "pt" ? "pt" : "en";
  const meta = findArticle(slug);
  const text = meta?.[language];
  const { previous, next } = findNeighbours(slug);
  const [content, setContent] = useState<ArticleContent | null>(null);
  const [failed, setFailed] = useState(false);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    // Trocar de artigo mantém a página montada: o scroll precisa voltar ao
    // topo. Pular para uma seção do mesmo artigo é tratado logo abaixo.
    if (!heading) window.scrollTo({ top: 0 });
    // heading de propósito fora das dependências: só o artigo dispara isto
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  /**
   * Leva até a seção quando a rota traz uma.
   *
   * Depende do conteúdo porque o HTML do artigo chega por import dinâmico: o
   * heading só existe no DOM depois que ele monta.
   */
  useEffect(() => {
    if (!heading || !content) return;
    const target = document.getElementById(heading);
    /* A opção passada em JS vence o `scroll-behavior` do CSS, então o bloco de
       `prefers-reduced-motion` do index.css não alcança esta chamada: quem
       pediu menos movimento continuava vendo a página deslizar. */
    target?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
  }, [heading, content, reducedMotion]);

  useEffect(() => {
    let cancelled = false;
    setContent(null);
    setFailed(false);

    loadArticleContent(slug, language)
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
  }, [slug, language]);

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

  /**
   * Reescreve as âncoras dos títulos para a rota do artigo.
   *
   * O plugin gera `href="#<id>"`, que é o certo para um markdown solto — mas
   * neste site um hash sem o prefixo da rota derruba o artigo e monta a home.
   * A correção fica aqui para o gerador de conteúdo não precisar saber de
   * roteamento.
   */
  useEffect(() => {
    if (!content) return;

    for (const anchor of document.querySelectorAll<HTMLAnchorElement>(
      ".article-anchor"
    )) {
      const id = anchor.getAttribute("href")?.replace(/^#/, "");
      if (id) anchor.setAttribute("href", articleHref(slug, id));
    }
  }, [content, slug]);

  /**
   * SEO do artigo. Sem isto, todo link compartilhado mostrava o título e a
   * imagem da home — oito artigos com o mesmo cartão.
   */
  useSEO(
    useMemo(
      () =>
        meta && text
          ? {
              title: `${text.title} | ${AUTHOR}`,
              description: text.excerpt,
              keywords: text.tag,
              // og:image precisa de URL, não do par src/half
              image: meta.thumb?.src ?? "/images/user.jpeg",
              url: `${SITE}/#/artigos/${meta.slug}`,
              canonicalUrl: meta.mediumUrl ?? `${SITE}/#/artigos/${meta.slug}`,
              type: "article",
            }
          : {},
      [meta, text]
    )
  );

  /* "Voltar" dizia história, mas ia para a home. Agora o rótulo e o destino
     concordam: a lista de artigos. */
  const goToArticles = () => {
    goToSection("articles");
  };

  if (!meta || !text || failed) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24">
        <Text as="h1" variant="sectionTitle" color="primary" align="center">
          {t("article.notFound")}
        </Text>
        <Button variant="secondary" icon={MdArrowBack} onClick={goToArticles}>
          {t("article.allArticles")}
        </Button>
      </div>
    );
  }

  const published = formatCatalogDate(meta.date, i18n.language, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-12 md:py-16">
      {content && <ReadingProgress />}

      <div className="xl:grid xl:grid-cols-[1fr_16rem] xl:gap-12">
        <article className="mx-auto w-full max-w-3xl">
      <div className="mb-10">
        <Button variant="tertiary" icon={MdArrowBack} onClick={goToArticles}>
          {t("article.allArticles")}
        </Button>
      </div>

      <header className="mb-10 border-b border-gray-200 pb-8">
        <p className="mb-4 font-poppins text-body-sm uppercase tracking-wider text-primary-600">
          {text.tag}
        </p>

        <Text
          as="h1"
          variant="heroTitle"
          color="primary"
          className="mb-4 text-display-sm md:text-display-md"
        >
          {text.title}
        </Text>

        <Text
          as="p"
          variant="sectionDescription"
          color="secondary"
          className="mb-6 text-body-md md:text-body-lg"
        >
          {text.excerpt}
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

      {content && content.language !== language && (
        /* Honesto em vez de esconder: o artigo existe e é legível, só não
           está traduzido ainda. */
        <p className="mb-8 rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 font-poppins text-body-sm text-primary-800">
          {t("article.onlyInPortuguese")}
        </p>
      )}

      {content ? (
        <div
          /* Os artigos são escritos em português, mesmo com a interface em
             inglês: marcar o idioma aqui é o que faz leitor de tela e tradutor
             do navegador tratarem o texto corretamente. */
          lang={content.language === "pt" ? "pt-BR" : "en"}
          className="article-content"
          dangerouslySetInnerHTML={{ __html: content.html }}
        />
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loading size="lg" />
        </div>
      )}

      {/* Sem isto o artigo termina no vazio: o único caminho era o botão
          "Voltar" lá no topo. */}
      <nav
        aria-label={t("article.allArticles")}
        className="mt-16 grid gap-4 border-t border-gray-200 pt-8 sm:grid-cols-2"
      >
        {previous ? (
          <a
            href={articleHref(previous.slug)}
            className="group rounded-xl border border-gray-200 p-4 transition-colors duration-300 hover:border-primary-300 hover:bg-primary-50
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span className="font-poppins text-body-xs uppercase tracking-wider text-gray-500">
              {t("article.previous")}
            </span>
            <span className="mt-1 block font-poppins text-body-md font-semibold text-gray-900 group-hover:text-primary-700">
              {previous[language].title}
            </span>
          </a>
        ) : (
          <span />
        )}

        {next && (
          <a
            href={articleHref(next.slug)}
            className="group rounded-xl border border-gray-200 p-4 text-right transition-colors duration-300 hover:border-primary-300 hover:bg-primary-50
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <span className="font-poppins text-body-xs uppercase tracking-wider text-gray-500">
              {t("article.next")}
            </span>
            <span className="mt-1 block font-poppins text-body-md font-semibold text-gray-900 group-hover:text-primary-700">
              {next[language].title}
            </span>
          </a>
        )}
      </nav>
        </article>

        {content && (
          <aside className="hidden xl:block">
            <ArticleToc
              slug={slug}
              headings={content.headings}
              label={t("article.toc")}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
