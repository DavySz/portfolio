export interface Service {
  title: string;
  description: string;
  /** Pinta o item com o gradiente da marca em vez do fundo neutro. */
  isHighlighted: boolean;
}

export interface ServiceListProps {
  data: Service[];
}
