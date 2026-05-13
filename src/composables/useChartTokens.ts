import { shallowRef, onMounted, watch } from 'vue';
import { readChartTokens, type ChartTokens } from '@/constants/charts';
import { useTheme } from './useTheme';

/**
 * Reactive chart-token bag. Re-reads the CSS variables whenever the active
 * theme changes (and on initial mount). Charts re-render only when this
 * shallow ref changes, so we avoid every per-tick rerender.
 */
export function useChartTokens() {
  const tokens = shallowRef<ChartTokens>(readChartTokens());
  const { theme } = useTheme();

  onMounted(() => {
    // Defer a frame so any class change has applied to <html>.
    requestAnimationFrame(() => {
      tokens.value = readChartTokens();
    });
  });

  watch(theme, () => {
    requestAnimationFrame(() => {
      tokens.value = readChartTokens();
    });
  });

  return tokens;
}
