/**
 * Tiny `classnames` substitute — accepts strings, falsy values, and
 * objects of `{ class: boolean }`. Avoids a runtime dependency.
 */
export type ClassValue = string | number | null | undefined | false | Record<string, unknown> | ClassValue[];

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  const push = (v: ClassValue): void => {
    if (!v) return;
    if (typeof v === 'string' || typeof v === 'number') {
      out.push(String(v));
      return;
    }
    if (Array.isArray(v)) {
      for (const it of v) push(it);
      return;
    }
    if (typeof v === 'object') {
      for (const k in v) {
        if ((v as Record<string, unknown>)[k]) out.push(k);
      }
    }
  };
  for (const v of values) push(v);
  return out.join(' ');
}
