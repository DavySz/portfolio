import { INIT_WORK_DATE } from "../../../shared/constants";
import { getYearsBetweenDates } from "../../../utils/get-years-between-dates";

export const STATISTICS = [
  {
    title: "Years of Experience",
    value: getYearsBetweenDates(INIT_WORK_DATE),
  },
  {
    title: "Project Completed",
    value: "50+",
  },
  {
    title: "Npm Contributions",
    value: "1",
  },
  {
    title: "Project Completed",
    value: "50+",
  },
];
