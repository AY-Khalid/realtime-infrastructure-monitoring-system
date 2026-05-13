import type { ZodSchema } from 'zod';

/**
 * Schema-validates a payload from an unsafe boundary (network, worker, etc.).
 * Returns `null` on failure so the caller can `if (!parsed) continue;` instead
 * of dealing with try/catch noise. Errors are logged once per type with
 * exponential backoff to avoid console spam.
 */
const _errorSeen: Record<string, number> = Object.create(null);

export function safeParse<T>(schema: ZodSchema<T>, payload: unknown, tag = 'payload'): T | null {
  const result = schema.safeParse(payload);
  if (result.success) return result.data;

  const now = Date.now();
  const last = _errorSeen[tag] ?? 0;
  if (now - last > 4_000) {
    _errorSeen[tag] = now;
    if (typeof console !== 'undefined') {
      console.warn(`[safeParse] dropped malformed ${tag}:`, result.error.issues.slice(0, 3));
    }
  }
  return null;
}
