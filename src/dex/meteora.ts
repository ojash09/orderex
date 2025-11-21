import { OrderRequest, Quote } from '../types';

function sleep(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export async function getMeteoraQuote(order: OrderRequest): Promise<Quote> {
  const start = Date.now();
  const latency = 250 + Math.floor(Math.random() * 900);
  await sleep(latency);

  const basePrice = 20;
  const priceJitter = 1 + (Math.random() - 0.5) * 0.03; // +/-1.5%
  const price = +(basePrice * priceJitter).toFixed(6);
  const slippage = +(0.0005 + Math.random() * 0.003).toFixed(6); // 0.05% - 0.35%
  const liquidityScore = Math.floor(30 + Math.random() * 70);

  return {
    venue: 'meteora',
    price,
    slippage,
    liquidityScore,
    latencyMs: Date.now() - start,
  };
}
