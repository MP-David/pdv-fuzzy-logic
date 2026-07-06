import { RULES } from './rules';
import {
  CASHBACK_DOMAIN,
  CASHBACK_SETS,
  CashbackLabel,
  ENGAGEMENT_SETS,
  EngagementLabel,
  fuzzify,
  TICKET_SETS,
  TicketLabel,
} from './sets';

export interface ActivatedRule {
  ticketSet: TicketLabel;
  engagementSet: EngagementLabel;
  outputSet: CashbackLabel;
  strength: number;
}

export interface FuzzyInferenceResult {
  ticketMemberships: Record<TicketLabel, number>;
  engagementMemberships: Record<EngagementLabel, number>;
  activatedRules: ActivatedRule[];
  cashbackRate: number;
}

const CENTROID_STEP = 0.05;

/**
 * Defuzzificação por centroide: soma ponderada de x pela pertinência agregada
 * (recortada por regra via mínimo, unida entre conjuntos via máximo), dividida
 * pela área total. Se nada ativou (denominador 0), retorna o mínimo do domínio.
 */
function centroid(aggregatedStrength: Record<CashbackLabel, number>): number {
  let numerator = 0;
  let denominator = 0;

  for (let x = CASHBACK_DOMAIN.min; x <= CASHBACK_DOMAIN.max; x += CENTROID_STEP) {
    let clippedMembership = 0;
    for (const set of CASHBACK_SETS) {
      const strength = aggregatedStrength[set.label];
      if (strength > 0) {
        clippedMembership = Math.max(clippedMembership, Math.min(strength, set.membership(x)));
      }
    }
    numerator += x * clippedMembership;
    denominator += clippedMembership;
  }

  return denominator === 0 ? CASHBACK_DOMAIN.min : numerator / denominator;
}

/**
 * Motor de inferência Mamdani completo: fuzzificação -> regras (T-norma mínimo)
 * -> agregação (S-norma máximo) -> defuzzificação (centroide).
 */
export function computeCashback(ticketValue: number, engagementScore: number): FuzzyInferenceResult {
  const ticketMemberships = fuzzify(ticketValue, TICKET_SETS);
  const engagementMemberships = fuzzify(engagementScore, ENGAGEMENT_SETS);

  const aggregatedStrength: Record<CashbackLabel, number> = {
    minimo: 0,
    padrao: 0,
    premium: 0,
  };
  const activatedRules: ActivatedRule[] = [];

  for (const rule of RULES) {
    const strength = Math.min(
      ticketMemberships[rule.ticketSet],
      engagementMemberships[rule.engagementSet],
    );
    if (strength > 0) {
      activatedRules.push({ ...rule, strength });
      aggregatedStrength[rule.outputSet] = Math.max(aggregatedStrength[rule.outputSet], strength);
    }
  }

  const cashbackRate = centroid(aggregatedStrength);

  return { ticketMemberships, engagementMemberships, activatedRules, cashbackRate };
}
