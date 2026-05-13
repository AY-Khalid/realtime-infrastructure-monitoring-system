<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { EChartsOption } from 'echarts';
import ChartShell from './ChartShell.vue';
import { axisDefaults, baseOption } from './baseOption';
import { useChartTokens } from '@/composables/useChartTokens';
import { useMetricsStore } from '@/stores/metrics';
import { useUiStore } from '@/stores/ui';
import { formatTime, formatBytesPerSecond } from '@/utils/format';

const tokens = useChartTokens();
const metrics = useMetricsStore();
const ui = useUiStore();
const { buckets } = storeToRefs(metrics);

function tail<T extends { t: number }>(arr: readonly T[], n: number, windowMs: number): readonly T[] {
  if (windowMs === 0) return arr.slice(-n);
  const cutoff = arr.length === 0 ? 0 : arr[arr.length - 1].t - windowMs;
  let lo = 0;
  while (lo < arr.length && arr[lo].t < cutoff) lo += 1;
  return arr.slice(Math.max(lo, arr.length - n));
}

const option = computed<EChartsOption>(() => {
  const t = tokens.value;
  const win = ui.activeTimeRange.windowMs;
  const inSeries = tail(buckets.value.networkIn.snapshot(), 30, win);
  const outSeries = tail(buckets.value.networkOut.snapshot(), 30, win);

  return {
    ...baseOption(t),
    grid: { left: 50, right: 14, top: 28, bottom: 26, containLabel: false },
    legend: {
      top: 0,
      right: 0,
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 14,
      icon: 'roundRect',
      textStyle: { color: t.textMuted, fontSize: 11 },
    },
    tooltip: {
      ...baseOption(t).tooltip,
      formatter: (params: any) => {
        if (!Array.isArray(params)) return '';
        const ts = params[0]?.axisValue;
        const rows = params
          .map(
            (p: any) =>
              `<div style="display:flex;justify-content:space-between;gap:14px;">
                <span style="color:${t.textMuted}"><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>
                <span>${formatBytesPerSecond(p.value[1])}</span>
              </div>`,
          )
          .join('');
        return `<div style="font-size:11px;color:${t.textMuted};margin-bottom:6px;">${formatTime(ts)}</div>${rows}`;
      },
    },
    xAxis: {
      type: 'time',
      ...axisDefaults(t),
      axisLabel: { ...axisDefaults(t).axisLabel, formatter: (v: number) => formatTime(v) },
    },
    yAxis: {
      type: 'value',
      ...axisDefaults(t),
      axisLabel: {
        ...axisDefaults(t).axisLabel,
        formatter: (v: number) => `${v.toFixed(0)} Mb`,
      },
    },
    series: [
      {
        name: 'Inbound',
        type: 'bar',
        stack: 'traffic',
        data: inSeries.map((p) => [p.t, p.v]),
        barMaxWidth: 14,
        itemStyle: { color: t.success, borderRadius: [3, 3, 0, 0] },
        emphasis: { focus: 'series', itemStyle: { color: t.success } },
      },
      {
        name: 'Outbound',
        type: 'bar',
        stack: 'traffic',
        data: outSeries.map((p) => [p.t, p.v]),
        barMaxWidth: 14,
        itemStyle: { color: t.warning, borderRadius: [3, 3, 0, 0] },
        emphasis: { focus: 'series' },
      },
    ],
  };
});
</script>

<template>
  <ChartShell :option="option" height="240px" />
</template>
