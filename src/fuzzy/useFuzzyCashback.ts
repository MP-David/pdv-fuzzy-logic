import { useMemo } from 'react';
import { computeCashback, FuzzyInferenceResult } from './inference';

/**
 * Liga o motor fuzzy (função pura) ao ciclo de renderização do React.
 * Recalcula apenas quando o ticket ou o engajamento mudam.
 */
export function useFuzzyCashback(
  ticketValue: number,
  engagementScore: number,
): FuzzyInferenceResult {
  return useMemo(
    () => computeCashback(ticketValue, engagementScore),
    [ticketValue, engagementScore],
  );
}
