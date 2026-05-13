<script setup lang="ts">
import { computed, ref } from 'vue';
import { storeToRefs } from 'pinia';
import {
  FlexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
  type ColumnFiltersState,
  type SortingState,
} from '@tanstack/vue-table';
import { useMetricsStore } from '@/stores/metrics';
import { useUiStore } from '@/stores/ui';
import type { ServerRow } from '@/types';
import { serverColumns } from './columns';
import StatusCell from './StatusCell.vue';
import UtilizationBar from './UtilizationBar.vue';
import TableFilters from './TableFilters.vue';
import { formatTime } from '@/utils/format';
import { getRegion } from '@/constants/regions';
import BaseButton from '../ui/BaseButton.vue';
import Icon from '../ui/Icon.vue';

const metrics = useMetricsStore();
const ui = useUiStore();
const { servers } = storeToRefs(metrics);
const { tableFilter } = storeToRefs(ui);

const sorting = ref<SortingState>([{ id: 'cpu', desc: true }]);
const columnFilters = ref<ColumnFiltersState>([]);

const data = computed<ServerRow[]>(() => {
  const f = tableFilter.value;
  const q = f.search.trim().toLowerCase();
  const out: ServerRow[] = [];
  for (const row of servers.value) {
    if (f.region !== 'all' && row.region !== f.region) continue;
    if (f.status !== 'all' && row.status !== f.status) continue;
    if (q && !`${row.serverId} ${row.region}`.toLowerCase().includes(q)) continue;
    out.push(row);
  }
  return out;
});

const table = useVueTable<ServerRow>({
  get data() {
    return data.value;
  },
  columns: serverColumns,
  state: {
    get sorting() {
      return sorting.value;
    },
    get columnFilters() {
      return columnFilters.value;
    },
  },
  onSortingChange: (updater) => {
    sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater;
  },
  onColumnFiltersChange: (updater) => {
    columnFilters.value = typeof updater === 'function' ? updater(columnFilters.value) : updater;
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  initialState: {
    pagination: { pageIndex: 0, pageSize: 12 },
  },
});
</script>

<template>
  <div class="flex h-full flex-col">
    <TableFilters />
    <div class="relative flex-1 overflow-auto">
      <table class="min-w-[760px] w-full text-left text-xs">
        <thead class="sticky top-0 z-10 bg-surface-raised/95 backdrop-blur">
          <tr
            v-for="hg in table.getHeaderGroups()"
            :key="hg.id"
            class="border-b border-border-subtle"
          >
            <th
              v-for="header in hg.headers"
              :key="header.id"
              :style="{ width: `${header.getSize()}px` }"
              class="px-3 py-2 text-2xs font-semibold uppercase tracking-wide text-content-muted select-none"
            >
              <button
                v-if="header.column.getCanSort()"
                type="button"
                class="inline-flex items-center gap-1 hover:text-content-primary"
                @click="header.column.toggleSorting()"
              >
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
                <span class="text-2xs tab-num text-content-muted">
                  {{ header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '' }}
                </span>
              </button>
              <span v-else>
                <FlexRender :render="header.column.columnDef.header" :props="header.getContext()" />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in table.getRowModel().rows"
            :key="row.id"
            class="group border-b border-border-subtle/60 transition-colors hover:bg-surface-inset/50"
          >
            <td class="px-3 py-2 tab-num text-content-secondary">
              {{ formatTime(row.original.t) }}
            </td>
            <td class="px-3 py-2 font-medium text-content-primary tab-num">
              {{ row.original.serverId }}
            </td>
            <td class="px-3 py-2 text-content-secondary">{{ getRegion(row.original.region).short }}</td>
            <td class="px-3 py-2"><UtilizationBar :value="row.original.cpu" /></td>
            <td class="px-3 py-2"><UtilizationBar :value="row.original.memory" /></td>
            <td class="px-3 py-2 tab-num text-content-secondary">{{ row.original.traffic.toFixed(1) }} Mb/s</td>
            <td class="px-3 py-2"><StatusCell :status="row.original.status" /></td>
          </tr>
          <tr v-if="data.length === 0">
            <td :colspan="serverColumns.length" class="px-4 py-10 text-center text-xs text-content-muted">
              No servers match the current filters.
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="flex items-center justify-between gap-3 border-t border-border-subtle px-4 py-2">
      <p class="text-2xs text-content-muted tab-num">
        Page {{ table.getState().pagination.pageIndex + 1 }} of {{ Math.max(1, table.getPageCount()) }} · {{ data.length }} servers
      </p>
      <div class="flex items-center gap-1.5">
        <BaseButton
          icon-only
          size="sm"
          variant="ghost"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <Icon name="chevron" :size="14" class="rotate-180" />
        </BaseButton>
        <BaseButton
          icon-only
          size="sm"
          variant="ghost"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <Icon name="chevron" :size="14" />
        </BaseButton>
      </div>
    </div>
  </div>
</template>
