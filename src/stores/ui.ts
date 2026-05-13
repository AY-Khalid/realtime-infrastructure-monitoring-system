import { defineStore } from 'pinia';
import { computed, ref, watch } from 'vue';
import { SIDEBAR_STORAGE_KEY } from '@/constants/app';
import { DEFAULT_TIME_RANGE, TIME_RANGES } from '@/constants/timeRanges';
import type { DatasetToggles, ServerTableFilter, TimeRangeKey } from '@/types';

function readSidebar(): boolean {
  try {
    const v = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (v === 'collapsed') return false;
    if (v === 'expanded') return true;
  } catch {
    /* ignore */
  }
  return true;
}

/**
 * UI store — purely client-side preferences: layout state, dataset toggles,
 * time-range selection, server-table filters.
 */
export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref<boolean>(readSidebar());
  const timeRange = ref<TimeRangeKey>(DEFAULT_TIME_RANGE);
  const datasets = ref<DatasetToggles>({
    cpu: true,
    memory: true,
    requests: true,
    networkIn: true,
    networkOut: true,
    errorRate: true,
  });
  const tableFilter = ref<ServerTableFilter>({
    region: 'all',
    status: 'all',
    search: '',
  });
  const chartsVisible = ref<Record<string, boolean>>({
    cpu: true,
    memory: true,
    network: true,
    heatmap: true,
    radar: true,
  });

  watch(sidebarOpen, (next) => {
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? 'expanded' : 'collapsed');
    } catch {
      /* ignore */
    }
  });

  const activeTimeRange = computed(
    () => TIME_RANGES.find((r) => r.key === timeRange.value) ?? TIME_RANGES[0],
  );

  function toggleSidebar(): void {
    sidebarOpen.value = !sidebarOpen.value;
  }
  function setTimeRange(key: TimeRangeKey): void {
    timeRange.value = key;
  }
  function toggleDataset(key: keyof DatasetToggles): void {
    datasets.value = { ...datasets.value, [key]: !datasets.value[key] };
  }
  function toggleChart(key: string): void {
    chartsVisible.value = { ...chartsVisible.value, [key]: !chartsVisible.value[key] };
  }
  function patchTableFilter(patch: Partial<ServerTableFilter>): void {
    tableFilter.value = { ...tableFilter.value, ...patch };
  }

  return {
    sidebarOpen,
    timeRange,
    activeTimeRange,
    datasets,
    tableFilter,
    chartsVisible,
    toggleSidebar,
    setTimeRange,
    toggleDataset,
    toggleChart,
    patchTableFilter,
  };
});
