export interface CareerGroup {
  /** Rótulo traduzido do grupo — "Produtos e frentes", "Desafios". */
  label: string;
  items: string[];
}

export interface CareerEntryProps {
  company: string;
  /** Cargo ou progressão de cargos, já montada no locale. */
  role: string;
  period: string;
  /** Uma linha sobre o que era a passagem, visível sem abrir os detalhes. */
  summary: string;
  /** Grupos do conteúdo revelado. Vazio não é esperado, mas não quebra. */
  groups: CareerGroup[];
  /** Rótulo da stack, que é uma linha corrida em vez de lista. */
  stackLabel: string;
  stack: string;
  /** Texto do disclosure. */
  moreLabel: string;
  /** `true` na passagem atual: muda o marcador da trilha. */
  isCurrent?: boolean;
  /** `false` no último item, que não desenha trilho para baixo. */
  hasNext?: boolean;
}
