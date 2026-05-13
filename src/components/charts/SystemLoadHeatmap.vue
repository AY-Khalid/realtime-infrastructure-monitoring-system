<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { EChartsOption } from 'echarts';
import ChartShell from './ChartShell.vue';
import { axisDefaults, baseOption } from './baseOption';
import { useChartTokens } from '@/composables/useChartTokens';
import { withAlpha } from '@/constants/charts';
import { useMetricsStore } from '@/stores/metrics';
import { REGIONS } from '@/constants/regions';
import { HEATMAP_NODES_PER_REGION } from '@/data/seed';

const tokens = useChartTokens();
const metrics = useMetricsStore();
const { heatmap } = storeToRefs(metrics);

const nodes = Array.from({ length: HEATMAP_NODES_PER_REGION }, (_, i) => `n${i + 1}`);
const regions = REGIONS.map((r) => r.short);
const regionKeys = REGIONS.map((r) => r.key);

const option = computed<EChartsOption>(() => {
  const t = tokens.value;
  const data: [number, number, number][] = [];
  for (const cell of heatmap.value) {
    const regionIdx = regionKeys.indexOf(cell.region);
    if (regionIdx < 0) continue;
    const nodeIdx = parseInt(cell.node.slice(1), 10) - 1;
    if (nodeIdx < 0) continue;
    data.push([nodeIdx, regionIdx, cell.load]);
  }

  return {
    ...baseOption(t),
    tooltip: {
      ...baseOption(t).tooltip,
      trigger: 'item',
      formatter: (p: any) => {
        const region = regions[p.value[1]];
        const node = nodes[p.value[0]];
        return `<div style="font-size:11px;color:${t.textMuted};margin-bottom:4px;">${region} · ${node}</div>
          <div style="display:flex;justify-content:space-between;gap:14px;"><span style="color:${t.textMuted}">load</span><span>${p.value[2].toFixed(1)}%</span></div>`;
      },
    },
    grid: { left: 60, right: 14, top: 14, bottom: 36, containLabel: false },
    visualMap: {
      min: 0,
      max: 100,
      orient: 'horizontal',
      left: 'center',
      bottom: 6,
      itemWidth: 160,
      itemHeight: 6,
      calculable: false,
      show: true,
      inRange: {
        color: [
          withAlpha(t.info, 0.55),
          t.success,
          t.warning,
          t.danger,
        ],
      },
      textStyle: { color: t.textMuted, fontSize: 10 },
      textGap: 6,
    },
    xAxis: {
      type: 'category',
      data: nodes,
      ...axisDefaults(t),
      axisLine: { show: false },
      splitLine: { show: false },
      splitArea: { show: false },
      boundaryGap: true,
    },
    yAxis: {
      type: 'category',
      data: regions,
      ...axisDefaults(t),
      axisLine: { show: false },
      splitLine: { show: false },
      splitArea: { show: false },
      boundaryGap: true,
    },
    series: [
      {
        type: 'heatmap',
        data,
        progressive: 200,
        itemStyle: { borderRadius: 4, borderColor: t.bg, borderWidth: 2 },
        emphasis: { itemStyle: { shadowBlur: 8, shadowColor: t.accent } },
        label: { show: false },
      },
    ],
  };
});
</script>

<template>
  <ChartShell :option="option" height="280px" />
</template>
