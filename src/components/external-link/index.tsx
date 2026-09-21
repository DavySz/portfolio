import clsx from "clsx";
import { useTranslation } from "react-i18next";
import {
  BASE_CLASSES,
  LABEL_CLASSES,
  iconColor,
  labelClasses,
  shapeClasses,
  surfaceClasses,
} from "../button/styles";
import type { ExternalLinkProps } from "./types";

/**
 * Link para fora do site, com a cara de um botão.
 *
 * Antes isto era `<button onClick={() => window.open(href, "_blank")}>`. Um
 * botão que navega perde clique do meio, "abrir em nova aba", "copiar endereço
 * do link" e o destino na barra de status; e o leitor de tela anuncia "botão",
 * então a pessoa não sabe que vai sair do site.
 *
 * `rel="noopener"` importa aqui: ao contrário de `<a target="_blank">`, que
 * ganhou `noopener` implícito nos navegadores modernos, `window.open` entrega
 * `window.opener` para a página aberta, que pode reescrever a aba de origem.
 *
 * O nome acessível sai sempre de texto real — nunca de `aria-label` —, porque
 * `aria-label` substituiria o aviso de nova aba em vez de somar a ele.
 */
export const ExternalLink: React.FC<ExternalLinkProps> = ({
  href,
  variant = "primary",
  icon: Icon,
  full = false,
  label,
  children,
}) => {
  const { t } = useTranslation("component");
  const hasLabel = Boolean(children);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        BASE_CLASSES,
        surfaceClasses(variant),
        shapeClasses(variant, hasLabel),
        full && "w-full"
      )}
    >
      {hasLabel && (
        <p className={clsx(LABEL_CLASSES, labelClasses(variant))}>{children}</p>
      )}
      {Icon && (
        <span className="transition-transform duration-300 hover:rotate-12">
          <Icon size={24} color={iconColor(variant)} />
        </span>
      )}
      {/* Sem texto visível (links só de ícone), `label` é o nome; com texto
          visível, só o aviso entra. */}
      <span className="sr-only">
        {hasLabel ? t("a11y.opensInNewTab") : `${label} — ${t("a11y.opensInNewTab")}`}
      </span>
    </a>
  );
};
