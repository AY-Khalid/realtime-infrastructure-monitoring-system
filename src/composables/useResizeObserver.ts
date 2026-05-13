import { onBeforeUnmount, onMounted, ref, type Ref } from 'vue';

interface Box {
  width: number;
  height: number;
}

/**
 * Lightweight ResizeObserver wrapper — rAF-batched to avoid layout thrash
 * when many observers fire at once.
 */
export function useResizeObserver(target: Ref<HTMLElement | null>) {
  const size = ref<Box>({ width: 0, height: 0 });
  let observer: ResizeObserver | null = null;
  let pending = 0;

  onMounted(() => {
    if (!('ResizeObserver' in window) || !target.value) return;
    observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      if (pending) cancelAnimationFrame(pending);
      pending = requestAnimationFrame(() => {
        pending = 0;
        const rect = entry.contentRect;
        size.value = { width: rect.width, height: rect.height };
      });
    });
    observer.observe(target.value);
  });

  onBeforeUnmount(() => {
    if (pending) cancelAnimationFrame(pending);
    observer?.disconnect();
    observer = null;
  });

  return size;
}
