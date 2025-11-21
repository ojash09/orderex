export type Side = 'buy' | 'sell';

export interface OrderRequest {
  clientId: string;
  side: Side;
  baseAsset: string;
  quoteAsset: string;
  amount: number; // amount in base asset (market)
}

export interface Quote {
  venue: string;
  price: number; // price in quoteAsset per baseAsset
  slippage: number; // fractional estimate e.g., 0.002 = 0.2%
  liquidityScore: number; // higher = better
  latencyMs?: number;
}

export interface ExecutionResult {
  success: boolean;
  txId?: string;
  error?: string;
  confirmations?: number;
}
