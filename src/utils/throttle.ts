/** Trailing-edge throttle. Calls run at most every `wait` ms. */
export function throttle<T extends (...args: any[]) => void>(fn: T, wait: number): T & { cancel: () => void } {
  let lastInvoked = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: any[] | null = null;

  const invoke = () => {
    lastInvoked = Date.now();
    timer = null;
    if (lastArgs) {
      fn(...lastArgs);
      lastArgs = null;
    }
  };

  const wrapped = ((...args: any[]) => {
    const now = Date.now();
    const remaining = wait - (now - lastInvoked);
    lastArgs = args;
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      invoke();
    } else if (!timer) {
      timer = setTimeout(invoke, remaining);
    }
  }) as T & { cancel: () => void };

  wrapped.cancel = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    lastArgs = null;
  };

  return wrapped;
}
