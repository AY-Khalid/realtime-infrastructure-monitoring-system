<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { EChartsOption } from 'echarts';
import ChartShell from './ChartShell.vue';
import { axisDefaults, baseOption } from './baseOption';
import { useChartTokens } from '@/composables/useChartTokens';
import { withAlpha } from '@/constants/charts';
import { useMetricsStore } from '@/stores/metrics';
import { useUiStore } from '@/stores/ui';
import { formatTime } from '@/utils/format';

const tokens = useChartTokens();
const metrics = useMetricsStore();
const ui = useUiStore();
const { buckets } = storeToRefs(metrics);

function clipByWindow<T extends { t: number }>(data: readonly T[], windowMs: number): readonly T[] {
  if (windowMs === 0 || data.length === 0) return data;
  const cutoff = data[data.length - 1].t - windowMs;
  let lo = 0;
  while (lo < data.length && data[lo].t < cutoff) lo += 1;
  return lo === 0 ? data : data.slice(lo);
}

const option = computed<EChartsOption>(() => {
  const t = tokens.value;
  const window = ui.activeTimeRange.windowMs;
  const memory = clipByWindow(buckets.value.memory.snapshot(), window);

  return {
    ...baseOption(t),
    grid: { left: 44, right: 14, top: 18, bottom: 28, containLabel: false },
    tooltip: {
      ...baseOption(t).tooltip,
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return '';
        return '<div style="font-size:11px;color:' + t.textMuted + ';margin-bottom:4px;">' + formatTime(p.axisValue) + '</div>' +
          '<div style="display:flex;justify-content:space-between;gap:14px;"><span style="color:' + t.textMuted + '">Memory</span><span>' + p.value[1].toFixed(1) + '%</span></div>';
      },
    },
    xAxis: {
      type: 'time',
      ...axisDefaults(t),
      axisLabel: { ...axisDefaults(t).axisLabel, formatter: (v: number) => formatTime(v) },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      ...axisDefaults(t),
      axisLabel: { ...axisDefaults(t).axisLabel, formatter: '{value}%' },
    },
    series: [
      {
        name: 'Memory',
        type: 'line',
        data: memory.map((p) => [p.t, p.v]),
        smooth: 0.45,
        showSymbol: false,
        sampling: 'lttb',
        lineStyle: { width: 1.8, color: t.info },
        itemStyle: { color: t.info },
        areaStyle: {
          opacity: 1,
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(t.info, 0.45) },
              { offset: 1, color: withAlpha(t.info, 0) },
            ],
          },
        },
        markLine: {
          symbol: 'none',
          silent: true,
          lineStyle: { color: t.warning, type: 'dashed', opacity: 0.5, width: 1 },
          data: [
            {
              yAxis: 85,
              label: { show: true, color: t.warning, fontSize: 10, formatter: 'soft cap 85%' },
            },
          ],
        },
      },
    ],
  };
});
</script>

<template>
  <ChartShell :option="option" height="240px" />
</template>
