/** Compact, monotonically-increasing-ish identifier. Not cryptographically secure. */
let _counter = 0;
export function uid(prefix = 'id'): string {
  _counter = (_counter + 1) | 0;
  return `${prefix}_${Date.now().toString(36)}_${_counter.toString(36)}`;
}
