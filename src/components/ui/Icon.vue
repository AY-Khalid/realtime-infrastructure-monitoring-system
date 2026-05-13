<script setup lang="ts">
import { computed } from 'vue';
import IconBase from './IconBase.vue';

/* Custom mini icon set — keeps bundle small, no lucide/heroicons dep. */
const PATHS: Record<string, string> = {
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  alert: 'M12 9v4 M12 17h.01 M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z',
  cpu: 'M4 4h16v16H4z M9 1v3 M15 1v3 M9 20v3 M15 20v3 M20 9h3 M20 14h3 M1 9h3 M1 14h3 M9 9h6v6H9z',
  memory: 'M3 8h18 M3 14h18 M5 5v3 M9 5v3 M13 5v3 M17 5v3 M19 5v3 M5 14v3 M9 14v3 M13 14v3 M17 14v3 M19 14v3 M3 3h18v18H3z',
  network: 'M6 6h.01 M6 18h.01 M18 6h.01 M18 18h.01 M3 12h18 M12 3v18 M21 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M21 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
  error: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z M15 9l-6 6 M9 9l6 6',
  server: 'M2 4h20v6H2z M2 14h20v6H2z M6 7h.01 M6 17h.01',
  pause: 'M6 4h4v16H6z M14 4h4v16h-4z',
  play: 'M5 3l14 9-14 9V3z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z M21 21l-4.3-4.3',
  filter: 'M3 4h18l-7 9v7l-4-2v-5L3 4z',
  sun: 'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z M12 1v2 M12 21v2 M4.22 4.22l1.42 1.42 M18.36 18.36l1.42 1.42 M1 12h2 M21 12h2 M4.22 19.78l1.42-1.42 M18.36 5.64l1.42-1.42',
  moon: 'M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79Z',
  menu: 'M3 6h18 M3 12h18 M3 18h18',
  close: 'M6 6l12 12 M6 18 18 6',
  refresh: 'M3 12a9 9 0 0 1 15-6.7L21 8 M3 16l3 2.7A9 9 0 0 0 21 12 M21 3v5h-5 M3 21v-5h5',
  logo: 'M5 19 11 19 13 12 17 24 20 16 22 18 27 18',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  chart: 'M3 3v18h18 M7 14l3-3 4 4 5-6',
  globe: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20',
  spark: 'M12 3v5 M12 16v5 M3 12h5 M16 12h5 M5.6 5.6l3.5 3.5 M14.9 14.9l3.5 3.5 M5.6 18.4l3.5-3.5 M14.9 9.1l3.5-3.5',
  chevron: 'M9 18l6-6-6-6',
  layers: 'M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5',
};

const props = defineProps<{ name: keyof typeof PATHS | string; size?: number | string }>();

const segments = computed(() => (PATHS[props.name] ?? PATHS.activity).split(/\s+M/).map((s, i) => (i === 0 ? s : 'M' + s)));
</script>

<template>
  <IconBase :size="size">
    <path v-for="(d, i) in segments" :key="i" :d="d" />
  </IconBase>
</template>
