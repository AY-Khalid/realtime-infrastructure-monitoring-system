export function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export function nextFrame(): Promise<number> {
  return new Promise((res) => requestAnimationFrame(res));
}

/**
 * Suspend setInterval/setTimeout when the page is hidden — caller passes in
 * `pause()` and `resume()` and we return a teardown function.
 */
export function attachVisibilityPause(onHide: () => void, onShow: () => void): () => void {
  if (!isBrowser()) return () => {};
  const handler = () => {
    if (document.hidden) onHide();
    else onShow();
  };
  document.addEventListener('visibilitychange', handler);
  return () => document.removeEventListener('visibilitychange', handler);
}
