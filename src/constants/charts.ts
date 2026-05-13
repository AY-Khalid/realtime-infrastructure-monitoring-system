/**
 * Shared ECharts theming. We avoid the heavyweight `echarts.registerTheme` API
 * because it makes it harder to react to live CSS variable changes; instead
 * we resolve theme tokens at chart-option time via getComputedStyle.
 *
 * All color tokens are returned as standard "rgb(r, g, b)" strings (comma form)
 * so they can be safely fed to ECharts' Canvas color parser and combined with
 * alpha via `withAlpha()`. The earlier "rgb(r g b)" space-separated form
 * silently breaks gradient fills on Canvas.
 */

export interface ChartTokens {
  text: string;
  textMuted: string;
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipFg: string;
  accent: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  bg: string;
  bgRaised: string;
  rgbTriples: {
    accent: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
  };
}

const FALLBACKS: ChartTokens = {
  text: 'rgb(15, 23, 42)',
  textMuted: 'rgb(100, 116, 139)',
  grid: 'rgb(226, 232, 240)',
  axis: 'rgb(148, 163, 184)',
  tooltipBg: 'rgb(15, 23, 42)',
  tooltipFg: 'rgb(248, 250, 252)',
  accent: 'rgb(99, 102, 241)',
  success: 'rgb(22, 163, 74)',
  warning: 'rgb(217, 119, 6)',
  danger: 'rgb(220, 38, 38)',
  info: 'rgb(8, 145, 178)',
  bg: 'rgb(255, 255, 255)',
  bgRaised: 'rgb(255, 255, 255)',
  rgbTriples: {
    accent: '99, 102, 241',
    success: '22, 163, 74',
    warning: '217, 119, 6',
    danger: '220, 38, 38',
    info: '8, 145, 178',
  },
};

function normaliseTriple(raw: string): string {
  return raw
    .trim()
    .replace(/[ ,]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .join(', ');
}

function rgb(raw: string, fallback: string): string {
  const t = normaliseTriple(raw);
  return t ? 'rgb(' + t + ')' : fallback;
}

export function readChartTokens(): ChartTokens {
  if (typeof window === 'undefined') return FALLBACKS;
  const cs = getComputedStyle(document.documentElement);
  const read = (n: string) => cs.getPropertyValue(n);

  const accentT = normaliseTriple(read('--accent')) || FALLBACKS.rgbTriples.accent;
  const successT = normaliseTriple(read('--success')) || FALLBACKS.rgbTriples.success;
  const warningT = normaliseTriple(read('--warning')) || FALLBACKS.rgbTriples.warning;
  const dangerT = normaliseTriple(read('--danger')) || FALLBACKS.rgbTriples.danger;
  const infoT = normaliseTriple(read('--info')) || FALLBACKS.rgbTriples.info;

  return {
    text: rgb(read('--content-primary'), FALLBACKS.text),
    textMuted: rgb(read('--content-muted'), FALLBACKS.textMuted),
    grid: rgb(read('--chart-grid'), FALLBACKS.grid),
    axis: rgb(read('--chart-axis'), FALLBACKS.axis),
    tooltipBg: rgb(read('--chart-tooltip-bg'), FALLBACKS.tooltipBg),
    tooltipFg: rgb(read('--chart-tooltip-fg'), FALLBACKS.tooltipFg),
    accent: 'rgb(' + accentT + ')',
    success: 'rgb(' + successT + ')',
    warning: 'rgb(' + warningT + ')',
    danger: 'rgb(' + dangerT + ')',
    info: 'rgb(' + infoT + ')',
    bg: rgb(read('--surface-base'), FALLBACKS.bg),
    bgRaised: rgb(read('--surface-raised'), FALLBACKS.bgRaised),
    rgbTriples: {
      accent: accentT,
      success: successT,
      warning: warningT,
      danger: dangerT,
      info: infoT,
    },
  };
}

export function withAlpha(color: string, alpha: number): string {
  const m = /rgba?\(([^)]+)\)/.exec(color);
  if (!m) return color;
  const triple = normaliseTriple(m[1]);
  if (!triple) return color;
  return 'rgba(' + triple + ', ' + alpha + ')';
}
