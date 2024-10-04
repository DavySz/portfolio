import { ServiceTableProps } from "../../../components/service-table/types";

export const SERVICES: ServiceTableProps["data"] = [
  {
    isHighlighted: true,
    title: "Mobile Development",
    description:
      "Build robust mobile applications that connect millions, delivering scalable and high-performance solutions.",
  },
  {
    isHighlighted: true,
    title: "Web Development",
    description:
      "Create secure, scalable web solutions that enhance user experiences and empower global connections.",
  },
  {
    isHighlighted: false,
    title: "UI/UX Design",
    description:
      "Design intuitive, responsive interfaces that drive seamless interactions and prioritize user satisfaction.",
  },
  {
    isHighlighted: false,
    title: "Backend Development",
    description:
      "Develop reliable backend systems that support billions of interactions with security and scalability.",
  },
];
