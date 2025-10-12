export const usePDF = () => {
  const download = (path: string) => {
    const link = document.createElement("a");
    link.href = path;
    link.download = path.split("/").pop() || "file.pdf";
    link.click();
  };

  return {
    download,
  };
};
