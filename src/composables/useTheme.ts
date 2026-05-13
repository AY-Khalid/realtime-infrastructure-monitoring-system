import { computed, onMounted, ref, watch } from 'vue';
import { useEventListener } from '@vueuse/core';
import { THEME_STORAGE_KEY } from '@/constants/app';
import type { Theme } from '@/types';

function readStoredTheme(): Theme | null {
  try {
    const v = localStorage.getItem(THEME_STORAGE_KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function systemTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const _theme = ref<Theme>(readStoredTheme() ?? systemTheme());

function applyTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('dark', 'light');
  root.classList.add(theme);
  root.style.colorScheme = theme;
}

export function useTheme() {
  onMounted(() => applyTheme(_theme.value));

  watch(_theme, (next) => {
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  });

  // Track system changes when the user hasn't explicitly chosen.
  useEventListener(
    typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null,
    'change',
    (e: MediaQueryListEvent) => {
      if (!readStoredTheme()) _theme.value = e.matches ? 'dark' : 'light';
    },
  );

  return {
    theme: computed(() => _theme.value),
    isDark: computed(() => _theme.value === 'dark'),
    setTheme(t: Theme) {
      _theme.value = t;
    },
    toggle() {
      _theme.value = _theme.value === 'dark' ? 'light' : 'dark';
    },
  };
}
