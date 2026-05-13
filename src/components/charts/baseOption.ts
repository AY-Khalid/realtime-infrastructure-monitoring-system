import type { EChartsOption } from 'echarts';
import type { ChartTokens } from '@/constants/charts';

/**
 * Common chart option scaffolding shared across all charts. We centralise it
 * so tooltips, axes, and grid spacing feel coherent.
 */
export function baseOption(tokens: ChartTokens): Partial<EChartsOption> {
  return {
    animation: true,
    animationDuration: 380,
    animationEasing: 'cubicOut',
    animationDurationUpdate: 320,
    animationEasingUpdate: 'cubicOut',
    textStyle: {
      color: tokens.text,
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: tokens.tooltipBg,
      borderWidth: 0,
      padding: [8, 10],
      textStyle: {
        color: tokens.tooltipFg,
        fontSize: 12,
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: tokens.axis,
          type: 'dashed',
          opacity: 0.6,
        },
      },
      extraCssText: 'border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.3);',
    },
    grid: { left: 36, right: 16, top: 18, bottom: 24, containLabel: false },
  };
}

export function axisDefaults(tokens: ChartTokens) {
  return {
    axisLine: { lineStyle: { color: tokens.axis, opacity: 0.6 } },
    axisTick: { show: false },
    axisLabel: {
      color: tokens.textMuted,
      fontSize: 10,
      fontFamily: 'JetBrains Mono, ui-monospace, monospace',
    },
    splitLine: { lineStyle: { color: tokens.grid, opacity: 0.6, type: 'dashed' as const } },
  };
}
