<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useActivityStore } from '@/stores/activity';
import { useVirtualList } from '@/composables/useVirtualList';
import { useNow } from '@/composables/useNow';
import ActivityRow from './ActivityRow.vue';
import ActivityFilters from './ActivityFilters.vue';
import EmptyState from '../ui/EmptyState.vue';

const ROW_HEIGHT = 56;

const activity = useActivityStore();
const { filtered } = storeToRefs(activity);

const containerRef = ref<HTMLElement | null>(null);
const { totalHeight, visibleItems } = useVirtualList(filtered, containerRef, {
  itemHeight: ROW_HEIGHT,
  overscan: 4,
});

const now = useNow(1000);
const hasEvents = computed(() => filtered.value.length > 0);
</script>

<template>
  <div class="flex h-full flex-col">
    <ActivityFilters />
    <div ref="containerRef" class="relative flex-1 overflow-auto">
      <div v-if="!hasEvents" class="flex h-full items-center justify-center">
        <EmptyState
          title="Awaiting events"
          description="Live activity from your fleet will appear here as soon as telemetry arrives."
          icon="·"
        />
      </div>
      <div
        v-else
        class="relative"
        :style="{ height: `${totalHeight}px` }"
      >
        <ActivityRow
          v-for="row in visibleItems"
          :key="row.item.id"
          :event="row.item"
          :now="now"
          :height="ROW_HEIGHT"
          :top="row.top"
        />
      </div>
    </div>
  </div>
</template>
