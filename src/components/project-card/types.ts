export type ProjectCategory =
  | "Frontend - Mobile"
  | "Frontend - Web"
  | "Backend"
  | "Fullstack"
  | "UI/UX Design"
  | "Data Science"
  | "Machine Learning"
  | "Artificial Intelligence"
  | "Cyber Security"
  | "Game Development"
  | "DevOps"
  | "Cloud Computing"
  | "Blockchain"
  | "Internet of Things"
  | "Augmented Reality"
  | "Virtual Reality"
  | "Mixed Reality"
  | "Quantum Computing"
  | "Big Data"
  | "Other";

export interface ProjectCardProps {
  category: ProjectCategory;
  thumb: string;
  title: string;
  link: string;
}
