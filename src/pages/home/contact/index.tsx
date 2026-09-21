import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { MdOutlineMailOutline, MdContentCopy } from "react-icons/md";
import { LuPhone } from "react-icons/lu";
import { FaLinkedin } from "react-icons/fa";
import { Text } from "../../../components/text";
import { CONTACTS, CONTACT_SECTION_ID } from "../../../shared/constants";

/** Quanto tempo o resultado de copiar fica visível, em ms. */
const FEEDBACK_DURATION = 2000;

type CopyState = "idle" | "copied" | "failed";

const ROW_CLASSES =
  "flex items-center gap-4 rounded-xl border border-gray-200 px-5 py-4 font-poppins text-body-md text-gray-900 transition-colors duration-300 hover:border-primary-300 hover:bg-primary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2";

/**
 * Bloco de contato, no fim da home.
 *
 * A página existe para gerar contato e não tinha destino: o CTA levava para o
 * LinkedIn antes de a pessoa ter visto qualquer coisa, e quem chegava
 * convencido no fim encontrava e-mail e telefone como texto para copiar à mão.
 * Aqui os três caminhos ficam juntos, e dois deles não exigem sair do site.
 */
export const Contact: React.FC = () => {
  const { t } = useTranslation("home");
  const { t: tc } = useTranslation("component");
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copyEmail = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(CONTACTS.GMAIL);
      setCopyState("copied");
    } catch {
      // Sem permissão de área de transferência, ou navegador sem a API: o
      // link `mailto:` ao lado continua sendo o caminho que sempre funciona.
      setCopyState("failed");
    }
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(
      () => setCopyState("idle"),
      FEEDBACK_DURATION
    );
  }, []);

  return (
    <section
      id={CONTACT_SECTION_ID}
      className="flex flex-col items-center justify-center py-16 md:py-24 px-6 xl:px-[100px]"
    >
      <Text
        as="h2"
        variant="sectionTitle"
        color="gradient"
        align="center"
        className="text-display-sm md:text-display-md mb-6"
      >
        {t("contact.title")}
      </Text>
      <Text
        as="p"
        variant="sectionDescription"
        color="secondary"
        align="center"
        className="text-body-md lg:text-body-xl mb-16 leading-relaxed max-w-section"
      >
        {t("contact.description")}
      </Text>

      <ul className="flex w-full max-w-xl flex-col gap-4">
        <li className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <a href={`mailto:${CONTACTS.GMAIL}`} className={`${ROW_CLASSES} flex-1`}>
            <MdOutlineMailOutline
              size={20}
              className="shrink-0 text-primary-600"
              aria-hidden="true"
            />
            <span className="break-all">{CONTACTS.GMAIL}</span>
          </a>
          {/* Botão separado do link: copiar e escrever são ações diferentes, e
              uma não pode roubar o clique da outra. */}
          <button
            type="button"
            onClick={copyEmail}
            className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-primary-500 px-5 py-4 font-poppins text-body-md font-semibold text-primary-700 transition-colors duration-300 hover:bg-primary-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            <MdContentCopy size={18} aria-hidden="true" />
            {t(`contact.${copyState === "idle" ? "copy" : copyState}`)}
          </button>
        </li>

        <li>
          <a
            href={CONTACTS.LINKEDIN}
            target="_blank"
            rel="noopener noreferrer"
            className={ROW_CLASSES}
          >
            <FaLinkedin
              size={20}
              className="shrink-0 text-primary-600"
              aria-hidden="true"
            />
            <span>LinkedIn</span>
            <span className="sr-only">{tc("a11y.opensInNewTab")}</span>
          </a>
        </li>

        <li>
          <a href={`tel:${CONTACTS.PHONE}`} className={ROW_CLASSES}>
            <LuPhone
              size={20}
              className="shrink-0 text-primary-600"
              aria-hidden="true"
            />
            <span>{CONTACTS.PHONE_DISPLAY}</span>
          </a>
        </li>
      </ul>

      {/*
        O rótulo do botão já muda, mas quem usa leitor de tela não recebe aviso
        de um texto que troca sozinho. `role="status"` anuncia a mudança sem
        roubar o foco; a região fica sempre no DOM, porque uma região viva
        inserida junto com o texto costuma não ser anunciada.
      */}
      <p role="status" aria-live="polite" className="sr-only">
        {copyState === "idle" ? "" : t(`contact.${copyState}`)}
      </p>
    </section>
  );
};
