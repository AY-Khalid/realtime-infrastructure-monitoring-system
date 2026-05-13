<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import type { EChartsOption } from 'echarts';
import ChartShell from './ChartShell.vue';
import { axisDefaults, baseOption } from './baseOption';
import { useChartTokens } from '@/composables/useChartTokens';
import { useMetricsStore } from '@/stores/metrics';
import { useUiStore } from '@/stores/ui';
import { formatTime } from '@/utils/format';

const tokens = useChartTokens();
const metrics = useMetricsStore();
const ui = useUiStore();
const { buckets } = storeToRefs(metrics);

function clipByWindow<T extends { t: number }>(
  data: readonly T[],
  windowMs: number,
): readonly T[] {
  if (windowMs === 0 || data.length === 0) return data;
  const cutoff = data[data.length - 1].t - windowMs;
  let lo = 0;
  while (lo < data.length && data[lo].t < cutoff) lo += 1;
  return lo === 0 ? data : data.slice(lo);
}

const option = computed<EChartsOption>(() => {
  const t = tokens.value;
  const window = ui.activeTimeRange.windowMs;
  const cpu = clipByWindow(buckets.value.cpu.snapshot(), window);
  const mem = clipByWindow(buckets.value.memory.snapshot(), window);
  const req = clipByWindow(buckets.value.requests.snapshot(), window);
  const err = clipByWindow(buckets.value.errorRate.snapshot(), window);

  const series: any[] = [];
  if (ui.datasets.cpu)
    series.push({
      name: 'CPU',
      type: 'line',
      data: cpu.map((p) => [p.t, p.v]),
      smooth: 0.35,
      showSymbol: false,
      sampling: 'lttb',
      lineStyle: { width: 1.8, color: t.accent },
      itemStyle: { color: t.accent },
      areaStyle: {
        opacity: 0.18,
        color: t.accent,
      },
      yAxisIndex: 0,
      emphasis: { focus: 'series' },
    });
  if (ui.datasets.memory)
    series.push({
      name: 'Memory',
      type: 'line',
      data: mem.map((p) => [p.t, p.v]),
      smooth: 0.4,
      showSymbol: false,
      sampling: 'lttb',
      lineStyle: { width: 1.4, color: t.info },
      itemStyle: { color: t.info },
      yAxisIndex: 0,
    });
  if (ui.datasets.errorRate)
    series.push({
      name: 'Error rate',
      type: 'line',
      data: err.map((p) => [p.t, p.v]),
      smooth: 0.5,
      showSymbol: false,
      sampling: 'lttb',
      lineStyle: { width: 1.2, color: t.danger, type: 'solid' },
      itemStyle: { color: t.danger },
      yAxisIndex: 0,
    });
  if (ui.datasets.requests)
    series.push({
      name: 'Requests',
      type: 'line',
      data: req.map((p) => [p.t, p.v]),
      smooth: 0.45,
      showSymbol: false,
      sampling: 'lttb',
      lineStyle: { width: 1.2, color: t.warning, opacity: 0.85 },
      itemStyle: { color: t.warning },
      yAxisIndex: 1,
    });

  return {
    ...baseOption(t),
    legend: {
      show: true,
      type: 'plain',
      top: 0,
      right: 0,
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 14,
      icon: 'circle',
      textStyle: { color: t.textMuted, fontSize: 11 },
    },
    grid: { left: 44, right: 50, top: 28, bottom: 28, containLabel: false },
    tooltip: {
      ...baseOption(t).tooltip,
      formatter: (params: any) => {
        if (!Array.isArray(params) || params.length === 0) return '';
        const ts = params[0].axisValue;
        const rows = params
          .map(
            (p: any) =>
              `<div style="display:flex;justify-content:space-between;gap:14px;">
                <span style="color:${t.textMuted}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px;"></span>${p.seriesName}</span>
                <span>${typeof p.value[1] === 'number' ? p.value[1].toFixed(1) : p.value[1]}${p.seriesName === 'Requests' ? '' : '%'}</span>
              </div>`,
          )
          .join('');
        return `<div style="font-size:11px;color:${t.textMuted};margin-bottom:6px;">${formatTime(ts)}</div>${rows}`;
      },
    },
    xAxis: {
      type: 'time',
      ...axisDefaults(t),
      axisLabel: {
        ...axisDefaults(t).axisLabel,
        formatter: (val: number) => formatTime(val),
      },
    },
    yAxis: [
      {
        type: 'value',
        min: 0,
        max: 100,
        position: 'left',
        ...axisDefaults(t),
        axisLabel: { ...axisDefaults(t).axisLabel, formatter: '{value}%' },
        name: 'Util %',
        nameTextStyle: { color: t.textMuted, fontSize: 10 },
      },
      {
        type: 'value',
        position: 'right',
        ...axisDefaults(t),
        splitLine: { show: false },
        axisLabel: {
          ...axisDefaults(t).axisLabel,
          formatter: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`),
        },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        throttle: 80,
        zoomOnMouseWheel: 'shift',
        moveOnMouseWheel: false,
      },
    ],
    series,
  };
});
</script>

<template>
  <ChartShell :option="option" height="280px" />
</template>
