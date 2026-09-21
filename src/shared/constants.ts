/** Âncora do bloco de contato, usada pelo CTA, pela nav e pelo rodapé. */
export const CONTACT_SECTION_ID = "contact";

export const CONTACTS = {
  LINKEDIN:
    "https://www.linkedin.com/in/davy-de-souza-assun%C3%A7%C3%A3o-0b7483180",
  INSTAGRAM: "https://instagram.com/davy_sz",
  GITHUB: "https://github.com/davysz",
  /** E.164, que é o formato aceito por `tel:` e pelo schema.org. */
  PHONE: "+5592992939794",
  /** Só para exibir: um número corrido é difícil de ler e pior de ouvir. */
  PHONE_DISPLAY: "+55 92 99293-9794",
  GMAIL: "davydesouzabar@gmail.com",
  MEDIUM: "https://medium.com/@davysz",
};

export const EN_CV_PATH = "/pdfs/davy-de-souza-assuncao-curriculum-en.pdf";
export const PT_CV_PATH = "/pdfs/davy-de-souza-assuncao-curriculum-pt.pdf";


/*
 * Mensagem para quem abre o console.
 *
 * Estava só em português num site que abre em inglês, começava com um
 * caractere corrompido (os bytes EF BF BD, o U+FFFD de substituição, onde
 * deveria haver um emoji) e anunciava Next.js — que é a stack do trabalho,
 * não a deste site, feito em Vite.
 */
export const WELCOME_LOG_MESSAGE = `%c👋 Hey there, curious dev!

    %c🔍 Reading the source? Love that.

    %cI'm Davy, a Frontend Engineer specialized in Fintech.
I build interfaces people trust to move money.

    💡 This site: React + TypeScript + Vite + three.js
    🏢 Work: Fretepago

    %c👉 Want the code behind this portfolio?
    🔗 github.com/davysz

    %c💬 Up for a chat about frontend, fintech or architecture?
    💌 linkedin.com/in/davy-de-souza-assuncao-0b7483180

    %cThanks for stopping by! ☕🚀`;

export const WELCOME_LOG_MESSAGE_STYLES = [
  "color: #7947DF; font-size: 18px; font-weight: bold;",
  "color: #10b981; font-size: 15px; font-weight: bold;",
  "color: #6b7280; font-size: 13px; line-height: 1.6;",
  "color: #3b82f6; font-size: 13px; font-weight: bold;",
  "color: #f59e0b; font-size: 13px;",
  "color: #8b5cf6; font-size: 13px; font-style: italic;",
];
