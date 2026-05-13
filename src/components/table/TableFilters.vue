<script setup lang="ts">
import { ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useDebounceFn } from '@vueuse/core';
import { useUiStore } from '@/stores/ui';
import { REGIONS } from '@/constants/regions';
import TextInput from '../ui/TextInput.vue';
import Select from '../ui/Select.vue';

const ui = useUiStore();
const { tableFilter } = storeToRefs(ui);
const search = ref(tableFilter.value.search);

const debounced = useDebounceFn((q: string) => ui.patchTableFilter({ search: q }), 180);
watch(search, (v) => debounced(v));

const regionOptions = [
  { value: 'all' as const, label: 'All regions' },
  ...REGIONS.map((r) => ({ value: r.key, label: r.short })),
];

const statusOptions = [
  { value: 'all' as const, label: 'Any status' },
  { value: 'healthy' as const, label: 'Healthy' },
  { value: 'degraded' as const, label: 'Degraded' },
  { value: 'critical' as const, label: 'Critical' },
  { value: 'offline' as const, label: 'Offline' },
];
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border-subtle">
    <TextInput v-model="search" placeholder="Filter servers…" icon="search" class="min-w-[160px]" />
    <Select
      :model-value="tableFilter.region"
      :options="regionOptions"
      aria-label="Region filter"
      @update:model-value="ui.patchTableFilter({ region: $event })"
    />
    <Select
      :model-value="tableFilter.status"
      :options="statusOptions"
      aria-label="Status filter"
      @update:model-value="ui.patchTableFilter({ status: $event })"
    />
  </div>
</template>
