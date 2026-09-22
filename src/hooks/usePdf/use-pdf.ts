/**
 * Baixa um arquivo do próprio site.
 *
 * O `<a download>` precisa estar NO documento na hora do clique: um elemento
 * solto funciona no Chrome e é ignorado por Firefox e Safari, então o botão
 * de currículo simplesmente não fazia nada em parte dos navegadores. Entra,
 * clica e sai no mesmo passo.
 */
export const usePDF = () => {
  const download = (path: string) => {
    const link = document.createElement("a");
    link.href = path;
    link.download = path.split("/").pop() || "file.pdf";
    // Mesmo sendo mesma origem, um `download` que o navegador decida abrir em
    // vez de baixar não deve entregar a aba de origem para a página aberta.
    link.rel = "noopener";
    link.style.display = "none";

    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return {
    download,
  };
};
