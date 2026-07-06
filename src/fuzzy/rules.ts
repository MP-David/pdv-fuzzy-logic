import { CashbackLabel, EngagementLabel, TicketLabel } from './sets';

export interface FuzzyRule {
  ticketSet: TicketLabel;
  engagementSet: EngagementLabel;
  outputSet: CashbackLabel;
}

/**
 * Base de conhecimento (3x3 = 9 regras). Completa a matriz a partir dos 3
 * exemplos do documento do projeto:
 *   Médio + Frequente -> Padrão
 *   Alto + VIP -> Premium
 *   Alto + Iniciante -> Padrão
 *
 *                  Iniciante   Frequente   VIP
 *      Baixo       Mínimo      Mínimo      Padrão
 *      Médio       Mínimo      Padrão      Premium
 *      Alto        Padrão      Premium     Premium
 */
export const RULES: FuzzyRule[] = [
  { ticketSet: 'baixo', engagementSet: 'iniciante', outputSet: 'minimo' },
  { ticketSet: 'baixo', engagementSet: 'frequente', outputSet: 'minimo' },
  { ticketSet: 'baixo', engagementSet: 'vip', outputSet: 'padrao' },
  { ticketSet: 'medio', engagementSet: 'iniciante', outputSet: 'minimo' },
  { ticketSet: 'medio', engagementSet: 'frequente', outputSet: 'padrao' },
  { ticketSet: 'medio', engagementSet: 'vip', outputSet: 'premium' },
  { ticketSet: 'alto', engagementSet: 'iniciante', outputSet: 'padrao' },
  { ticketSet: 'alto', engagementSet: 'frequente', outputSet: 'premium' },
  { ticketSet: 'alto', engagementSet: 'vip', outputSet: 'premium' },
];
