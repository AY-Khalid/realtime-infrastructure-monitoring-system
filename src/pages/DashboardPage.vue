<script setup lang="ts">
import { ref } from 'vue';
import DashboardLayout from '@/app/layouts/DashboardLayout.vue';
import { useStreaming } from '@/composables/useStreaming';
import { useUiStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';

import KpiGrid from '@/components/cards/KpiGrid.vue';
import ConnectionBanner from '@/components/ui/ConnectionBanner.vue';
import BaseCard from '@/components/ui/BaseCard.vue';

import CpuLineChart from '@/components/charts/CpuLineChart.vue';
import MemoryAreaChart from '@/components/charts/MemoryAreaChart.vue';
import NetworkBarChart from '@/components/charts/NetworkBarChart.vue';
import SystemLoadHeatmap from '@/components/charts/SystemLoadHeatmap.vue';
import ServerRadarChart from '@/components/charts/ServerRadarChart.vue';

import ActivityFeed from '@/components/feed/ActivityFeed.vue';
import ServerTable from '@/components/table/ServerTable.vue';

import DatasetToggles from '@/components/controls/DatasetToggles.vue';
import TimeRangePicker from '@/components/controls/TimeRangePicker.vue';
import ChartVisibility from '@/components/controls/ChartVisibility.vue';
import Icon from '@/components/ui/Icon.vue';

const ui = useUiStore();
const { chartsVisible } = storeToRefs(ui);

const stream = useStreaming();
const paused = ref(false);

function toggleStream(): void {
  if (paused.value) {
    stream.resume();
    paused.value = false;
  } else {
    stream.pause();
    paused.value = true;
  }
}

function forceDisconnect(): void {
  stream.forceDisconnect();
}
</script>

<template>
  <DashboardLayout
    :paused="paused"
    @toggle-stream="toggleStream"
    @force-disconnect="forceDisconnect"
  >
    <div class="space-y-4 p-4 md:p-6">
      <ConnectionBanner />

      <!-- Top bar: KPI summary -->
      <section>
        <KpiGrid />
      </section>

      <!-- Mobile-only time range -->
      <section class="lg:hidden">
        <TimeRangePicker />
      </section>

      <!-- Chart grid -->
      <section class="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <BaseCard v-if="chartsVisible.cpu" class="xl:col-span-8" title="CPU · Memory · Errors" subtitle="Composite real-time view">
          <template #actions>
            <div class="flex items-center gap-2">
              <DatasetToggles />
            </div>
          </template>
          <CpuLineChart />
        </BaseCard>

        <BaseCard v-if="chartsVisible.memory" class="xl:col-span-4" title="Memory utilization" subtitle="Gradient area · rolling window">
          <MemoryAreaChart />
        </BaseCard>

        <BaseCard v-if="chartsVisible.network" class="xl:col-span-6" title="Network traffic" subtitle="In/out throughput per second">
          <NetworkBarChart />
        </BaseCard>

        <BaseCard v-if="chartsVisible.heatmap" class="xl:col-span-6" title="Cluster load heatmap" subtitle="Per-region · per-node">
          <SystemLoadHeatmap />
        </BaseCard>

        <BaseCard v-if="chartsVisible.radar" class="xl:col-span-5" title="Regional health radar" subtitle="Compare regions across six dimensions">
          <ServerRadarChart />
        </BaseCard>

        <BaseCard class="xl:col-span-7" :padded="false" title="Live activity feed" subtitle="Streaming events · capped retention">
          <template #actions>
            <span class="inline-flex items-center gap-1 text-2xs text-content-muted">
              <span class="live-dot" />
              live
            </span>
          </template>
          <div class="h-[420px]">
            <ActivityFeed />
          </div>
        </BaseCard>
      </section>

      <!-- Server table -->
      <section>
        <BaseCard title="Fleet inventory" subtitle="Sortable · filterable · paginated" :padded="false">
          <template #actions>
            <div class="hidden md:flex items-center gap-2">
              <ChartVisibility />
            </div>
          </template>
          <div class="h-[520px]">
            <ServerTable />
          </div>
        </BaseCard>
      </section>

      <footer class="flex flex-wrap items-center justify-between gap-2 pt-2 text-2xs text-content-muted">
        <p class="inline-flex items-center gap-2">
          <Icon name="spark" :size="12" />
          Telemetry stream is mocked client-side · payloads validated via Zod · rendered with ECharts on Canvas.
        </p>
        <p class="tab-num">Pulse · production preview</p>
      </footer>
    </div>
  </DashboardLayout>
</template>
