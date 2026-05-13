<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';
import BaseButton from '../ui/BaseButton.vue';

const ui = useUiStore();
const { chartsVisible } = storeToRefs(ui);

const items = [
  { key: 'cpu', label: 'CPU' },
  { key: 'memory', label: 'Memory' },
  { key: 'network', label: 'Network' },
  { key: 'heatmap', label: 'Heatmap' },
  { key: 'radar', label: 'Radar' },
];
</script>

<template>
  <div class="flex flex-wrap items-center gap-1">
    <BaseButton
      v-for="it in items"
      :key="it.key"
      size="sm"
      variant="ghost"
      :active="chartsVisible[it.key]"
      @click="ui.toggleChart(it.key)"
    >
      {{ it.label }}
    </BaseButton>
  </div>
</template>
