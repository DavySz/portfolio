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
  | "Article"
  | "Other";

import type { ImageSource } from "../responsive-image/types";

export interface ProjectCardProps {
  category: ProjectCategory;
  thumb: ImageSource;
  title: string;
  link: string;
}
