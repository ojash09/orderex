import { Quote } from '../types';

/**
 * Simple router: pick the quote with lowest effective price (price * (1 + slippage)).
 * If tie, pick higher liquidityScore, then lower latency.
 */
export function pickBestQuote(quotes: Quote[]): Quote {
  if (!quotes || quotes.length === 0) throw new Error('no quotes');
  const withEffective = quotes.map(q => ({
    ...q,
    effective: q.price * (1 + (q.slippage ?? 0))
  }));

  withEffective.sort((a, b) => {
    if (a.effective !== b.effective) return a.effective - b.effective;
    if (b.liquidityScore !== a.liquidityScore) return b.liquidityScore - a.liquidityScore;
    return (a.latencyMs ?? 0) - (b.latencyMs ?? 0);
  });

  // return first
  const chosen = withEffective[0];
  // remove effective before returning (type safety)
  const { effective, ...rest } = chosen;
  return rest as Quote;
}
