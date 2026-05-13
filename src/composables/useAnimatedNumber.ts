import { ref, watch, onBeforeUnmount, type Ref } from 'vue';

interface Options {
  duration?: number;
  easing?: (t: number) => number;
}

const easeOutExpo = (t: number): number => (t === 1 ? 1 : 1 - 2 ** (-10 * t));

/**
 * Tween a numeric ref toward its target whenever it changes. Uses rAF,
 * cancels in-flight tweens on update, and cleans up on unmount.
 */
export function useAnimatedNumber(source: Ref<number>, opts: Options = {}) {
  const display = ref<number>(source.value);
  const duration = opts.duration ?? 600;
  const ease = opts.easing ?? easeOutExpo;
  let raf = 0;

  watch(
    source,
    (next, prev) => {
      cancelAnimationFrame(raf);
      const from = prev ?? next;
      const delta = next - from;
      if (Math.abs(delta) < 1e-4) {
        display.value = next;
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / duration);
        display.value = from + delta * ease(t);
        if (t < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    },
    { immediate: false },
  );

  onBeforeUnmount(() => cancelAnimationFrame(raf));

  return display;
}
