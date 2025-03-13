export const getYearsBetweenDates = (date: string): number => {
  const initial = new Date(date);
  const current = new Date();
  const diff = current.getTime() - initial.getTime();
  const years = diff / (1000 * 60 * 60 * 24 * 365);
  return Math.round(years);
};
