export interface SkillCardProps {
  onClick: () => void;
  data: {
    icon: JSX.Element;
    link: string;
    title: string;
  };
}
