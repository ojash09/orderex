export async function withRetries<T>(fn: () => Promise<T>, maxRetries = 3, initialDelayMs = 500): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;
  let lastErr: any = null;

  while (attempt < maxRetries) {
    try {
      const res = await fn();
      return res;
    } catch (err) {
      lastErr = err;
      attempt++;
      if (attempt >= maxRetries) break;
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
    }
  }
  throw lastErr ?? new Error('withRetries: failed without error');
}
