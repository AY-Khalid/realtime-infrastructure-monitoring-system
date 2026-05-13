import { computed, ref, onBeforeUnmount, onMounted, watch, type Ref } from 'vue';

interface Options {
  itemHeight: number;
  overscan?: number;
}

/**
 * Fixed-height virtual list. Renders only the items inside the scroll viewport
 * plus an overscan buffer. Designed for the activity feed but generic.
 */
export function useVirtualList<T>(
  items: Ref<readonly T[]>,
  container: Ref<HTMLElement | null>,
  options: Options,
) {
  const scrollTop = ref(0);
  const viewportHeight = ref(0);
  const itemHeight = options.itemHeight;
  const overscan = options.overscan ?? 6;

  let raf = 0;
  function onScroll(): void {
    if (!container.value) return;
    const top = container.value.scrollTop;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      scrollTop.value = top;
    });
  }

  let ro: ResizeObserver | null = null;
  onMounted(() => {
    if (!container.value) return;
    viewportHeight.value = container.value.clientHeight;
    container.value.addEventListener('scroll', onScroll, { passive: true });
    if ('ResizeObserver' in window) {
      ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        viewportHeight.value = entry.contentRect.height;
      });
      ro.observe(container.value);
    }
  });

  onBeforeUnmount(() => {
    if (raf) cancelAnimationFrame(raf);
    if (container.value) container.value.removeEventListener('scroll', onScroll);
    ro?.disconnect();
  });

  // Reset scrollTop sanely if the list shrinks below current scrollTop.
  watch(items, (next) => {
    if (!container.value) return;
    const max = Math.max(0, next.length * itemHeight - viewportHeight.value);
    if (scrollTop.value > max) container.value.scrollTop = 0;
  });

  const totalHeight = computed(() => items.value.length * itemHeight);

  const range = computed(() => {
    const start = Math.max(0, Math.floor(scrollTop.value / itemHeight) - overscan);
    const visible = Math.ceil(viewportHeight.value / itemHeight) + overscan * 2;
    const end = Math.min(items.value.length, start + visible);
    return { start, end };
  });

  const visibleItems = computed(() => {
    const { start, end } = range.value;
    const out: { index: number; item: T; top: number }[] = [];
    for (let i = start; i < end; i += 1) {
      out.push({ index: i, item: items.value[i], top: i * itemHeight });
    }
    return out;
  });

  return { totalHeight, visibleItems, scrollTop };
}
