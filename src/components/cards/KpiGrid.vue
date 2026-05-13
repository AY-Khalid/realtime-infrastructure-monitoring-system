<script setup lang="ts">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useMetricsStore } from '@/stores/metrics';
import KpiCard from './KpiCard.vue';

const metrics = useMetricsStore();
const { latestSnapshot, buckets, cpuTrend, memoryTrend, requestsTrend, networkInTrend, errorTrend } =
  storeToRefs(metrics);

const cpuSpark = computed(() => buckets.value.cpu.snapshot());
const memSpark = computed(() => buckets.value.memory.snapshot());
const reqSpark = computed(() => buckets.value.requests.snapshot());
const netSpark = computed(() => buckets.value.networkIn.snapshot());
const errSpark = computed(() => buckets.value.errorRate.snapshot());

const loading = computed(() => latestSnapshot.value === null);
</script>

<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
    <KpiCard
      label="CPU usage"
      icon="cpu"
      tone="accent"
      :value="latestSnapshot?.cpu ?? 0"
      format="percent"
      :digits="1"
      :trend="cpuTrend"
      :spark="cpuSpark"
      :loading="loading"
    />
    <KpiCard
      label="Memory"
      icon="memory"
      tone="info"
      :value="latestSnapshot?.memory ?? 0"
      format="percent"
      :digits="1"
      :trend="memoryTrend"
      :spark="memSpark"
      :loading="loading"
    />
    <KpiCard
      label="Active requests"
      icon="activity"
      tone="success"
      :value="latestSnapshot?.requests ?? 0"
      format="auto"
      :digits="1"
      suffix="/s"
      :trend="requestsTrend"
      :spark="reqSpark"
      :loading="loading"
    />
    <KpiCard
      label="Network in"
      icon="network"
      tone="warning"
      :value="latestSnapshot?.networkIn ?? 0"
      format="plain"
      :digits="1"
      suffix="Mb/s"
      :trend="networkInTrend"
      :spark="netSpark"
      :loading="loading"
    />
    <KpiCard
      label="Error rate"
      icon="error"
      tone="danger"
      :value="latestSnapshot?.errorRate ?? 0"
      format="plain"
      :digits="2"
      suffix="%"
      :trend="errorTrend"
      invert-trend
      :spark="errSpark"
      :loading="loading"
    />
    <KpiCard
      label="Active servers"
      icon="server"
      tone="neutral"
      :value="latestSnapshot?.activeServers ?? 0"
      format="plain"
      :digits="0"
      :loading="loading"
    />
  </div>
</template>
