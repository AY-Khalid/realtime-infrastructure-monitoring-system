<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { EChartsOption } from 'echarts';
import ChartShell from './ChartShell.vue';
import { baseOption } from './baseOption';
import { useChartTokens } from '@/composables/useChartTokens';
import { useMetricsStore } from '@/stores/metrics';
import { REGIONS, getRegion } from '@/constants/regions';

const tokens = useChartTokens();
const metrics = useMetricsStore();
const { regions } = storeToRefs(metrics);

const PALETTE = ['accent', 'success', 'info', 'warning', 'danger', 'accent', 'info'] as const;

const option = computed<EChartsOption>(() => {
  const t = tokens.value;
  const colorFor = (i: number): string => {
    const c = PALETTE[i % PALETTE.length];
    return (t as any)[c] as string;
  };

  return {
    ...baseOption(t),
    tooltip: {
      ...baseOption(t).tooltip,
      trigger: 'item',
    },
    legend: {
      type: 'scroll',
      bottom: 4,
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 12,
      icon: 'circle',
      textStyle: { color: t.textMuted, fontSize: 10 },
    },
    radar: {
      shape: 'polygon',
      radius: '60%',
      center: ['50%', '42%'],
      splitNumber: 4,
      axisName: {
        color: t.textMuted,
        fontSize: 10,
      },
      splitArea: { areaStyle: { color: [t.bg, t.bgRaised], opacity: 0.18 } },
      splitLine: { lineStyle: { color: t.grid, opacity: 0.6 } },
      axisLine: { lineStyle: { color: t.grid, opacity: 0.6 } },
      indicator: [
        { name: 'CPU', max: 100 },
        { name: 'Memory', max: 100 },
        { name: 'Speed', max: 100 },
        { name: 'Uptime', max: 100 },
        { name: 'Throughput', max: 100 },
        { name: 'Stability', max: 100 },
      ],
    },
    series: [
      {
        type: 'radar',
        symbol: 'circle',
        symbolSize: 4,
        emphasis: { focus: 'series', lineStyle: { width: 2 } },
        data: regions.value.map((rh) => {
          const meta = getRegion(rh.region);
          const color = colorFor(REGIONS.findIndex((r) => r.key === rh.region));
          return {
            name: meta.short,
            value: [
              rh.cpu,
              rh.memory,
              rh.latency,
              rh.uptime,
              rh.throughput,
              100 - rh.errors,
            ],
            lineStyle: { width: 1.6, color },
            itemStyle: { color },
            areaStyle: {
              opacity: 0.18,
              color,
            },
          };
        }),
      },
    ],
  };
});
</script>

<template>
  <ChartShell :option="option" height="320px" />
</template>
