<script setup lang="ts">
import { ref, shallowRef, watch, onBeforeUnmount, onMounted, computed } from 'vue';
import VChart from 'vue-echarts';
import type { EChartsOption, SetOptionOpts } from 'echarts';
import { installECharts } from './setupECharts';
import { useResizeObserver } from '@/composables/useResizeObserver';
import BaseSkeleton from '../ui/BaseSkeleton.vue';

installECharts();

interface Props {
  option: EChartsOption;
  loading?: boolean;
  height?: string;
  /** Replace data without diff — used for append-only series. */
  notMerge?: boolean;
  /** Lazy mount when offscreen. */
  autosize?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  height: '260px',
  notMerge: false,
  autosize: true,
});

const wrap = ref<HTMLElement | null>(null);
const chartRef = shallowRef<InstanceType<typeof VChart> | null>(null);
const size = useResizeObserver(wrap);

const updateOptions = computed<SetOptionOpts>(() => ({
  notMerge: props.notMerge,
  lazyUpdate: true,
  replaceMerge: props.notMerge ? ['series'] : undefined,
}));

let resizeRaf = 0;
watch(size, () => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  resizeRaf = requestAnimationFrame(() => {
    resizeRaf = 0;
    (chartRef.value as any)?.resize?.();
  });
});

onMounted(() => {
  // First resize after mount just in case parent finished layout late.
  requestAnimationFrame(() => (chartRef.value as any)?.resize?.());
});

onBeforeUnmount(() => {
  if (resizeRaf) cancelAnimationFrame(resizeRaf);
  (chartRef.value as any)?.dispose?.();
});
</script>

<template>
  <div ref="wrap" class="relative w-full" :style="{ height }">
    <BaseSkeleton v-if="loading" :height="height" rounded="rounded-md" />
    <VChart
      v-else
      ref="chartRef"
      class="h-full w-full"
      :option="option"
      :update-options="updateOptions"
      autoresize
      :init-options="{ renderer: 'canvas' }"
    />
  </div>
</template>
