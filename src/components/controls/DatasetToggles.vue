<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';
import BaseButton from '../ui/BaseButton.vue';
import type { DatasetToggles as DT } from '@/types';

const ui = useUiStore();
const { datasets } = storeToRefs(ui);

const items: { key: keyof DT; label: string; dotClass: string }[] = [
  { key: 'cpu', label: 'CPU', dotClass: 'bg-accent' },
  { key: 'memory', label: 'Memory', dotClass: 'bg-info' },
  { key: 'requests', label: 'Requests', dotClass: 'bg-warning' },
  { key: 'errorRate', label: 'Errors', dotClass: 'bg-danger' },
];
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <BaseButton
      v-for="it in items"
      :key="it.key"
      size="sm"
      variant="ghost"
      :active="datasets[it.key]"
      @click="ui.toggleDataset(it.key)"
    >
      <span class="h-1.5 w-1.5 rounded-full" :class="it.dotClass" />
      <span class="ml-1">{{ it.label }}</span>
    </BaseButton>
  </div>
</template>
