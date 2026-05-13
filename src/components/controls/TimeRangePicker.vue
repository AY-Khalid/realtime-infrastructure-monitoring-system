<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';
import { TIME_RANGES } from '@/constants/timeRanges';
import SegmentedControl from '../ui/SegmentedControl.vue';
import type { TimeRangeKey } from '@/types';

const ui = useUiStore();
const { timeRange } = storeToRefs(ui);

const options = TIME_RANGES.map((r) => ({ value: r.key, label: r.label }));

function onChange(v: TimeRangeKey): void {
  ui.setTimeRange(v);
}
</script>

<template>
  <SegmentedControl
    :model-value="timeRange"
    :options="options"
    aria-label="Time range"
    @update:model-value="onChange"
  />
</template>
