import { onBeforeUnmount, onMounted, ref } from 'vue';

/**
 * A coarse `Date.now()` ref that updates on a fixed interval. Used by
 * relative-time labels so they re-render without each component touching
 * its own timer.
 */
export function useNow(intervalMs = 1_000) {
  const now = ref(Date.now());
  let timer: ReturnType<typeof setInterval> | null = null;

  onMounted(() => {
    timer = setInterval(() => {
      now.value = Date.now();
    }, intervalMs);
  });

  onBeforeUnmount(() => {
    if (timer) clearInterval(timer);
    timer = null;
  });

  return now;
}
