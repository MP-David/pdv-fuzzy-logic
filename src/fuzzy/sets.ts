import { trapezoid, triangle } from './membershipFunctions';

export type TicketLabel = 'baixo' | 'medio' | 'alto';
export type EngagementLabel = 'iniciante' | 'frequente' | 'vip';
export type CashbackLabel = 'minimo' | 'padrao' | 'premium';

export interface FuzzySet<Label extends string> {
  label: Label;
  membership: (x: number) => number;
}

/** Valor do Ticket (R$). Baixo 0-100, Médio 50-250, Alto a partir de 150 (pleno a partir de 250). */
export const TICKET_SETS: FuzzySet<TicketLabel>[] = [
  { label: 'baixo', membership: x => trapezoid(x, 0, 0, 50, 100) },
  { label: 'medio', membership: x => triangle(x, 50, 150, 250) },
  { label: 'alto', membership: x => trapezoid(x, 150, 250, 600, 600) },
];

/** Engajamento do cliente, score sintético 0-100. */
export const ENGAGEMENT_SETS: FuzzySet<EngagementLabel>[] = [
  { label: 'iniciante', membership: x => trapezoid(x, 0, 0, 20, 50) },
  { label: 'frequente', membership: x => triangle(x, 20, 50, 80) },
  { label: 'vip', membership: x => trapezoid(x, 50, 80, 100, 100) },
];

/** Taxa de Cashback (%). Mínimo 1-2%, Padrão 3-5%, Premium 6-10%. */
export const CASHBACK_SETS: FuzzySet<CashbackLabel>[] = [
  { label: 'minimo', membership: x => trapezoid(x, 0, 0, 1, 2.5) },
  { label: 'padrao', membership: x => triangle(x, 2, 4, 6) },
  { label: 'premium', membership: x => trapezoid(x, 5, 7, 10, 10) },
];

export const CASHBACK_DOMAIN = { min: 0, max: 10 };

export const TICKET_LABELS: Record<TicketLabel, string> = {
  baixo: 'Baixo',
  medio: 'Médio',
  alto: 'Alto',
};

export const ENGAGEMENT_LABELS: Record<EngagementLabel, string> = {
  iniciante: 'Iniciante',
  frequente: 'Frequente',
  vip: 'VIP',
};

export const CASHBACK_LABELS: Record<CashbackLabel, string> = {
  minimo: 'Mínimo',
  padrao: 'Padrão',
  premium: 'Premium',
};

/** Fuzzificação: calcula o grau de pertinência de x em cada conjunto linguístico. */
export function fuzzify<Label extends string>(
  x: number,
  sets: FuzzySet<Label>[],
): Record<Label, number> {
  const result = {} as Record<Label, number>;
  for (const set of sets) {
    result[set.label] = set.membership(x);
  }
  return result;
}
