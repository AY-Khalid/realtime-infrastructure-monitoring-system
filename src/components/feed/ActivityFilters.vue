<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useActivityStore } from '@/stores/activity';
import { storeToRefs } from 'pinia';
import BaseButton from '../ui/BaseButton.vue';
import TextInput from '../ui/TextInput.vue';
import BaseBadge from '../ui/BaseBadge.vue';
import type { Severity } from '@/types';

const activity = useActivityStore();
const { filter, counts } = storeToRefs(activity);

const search = ref(filter.value.search);

const debouncedSet = useDebounceFn((v: string) => activity.setSearch(v), 200);
watch(search, (v) => debouncedSet(v));

const sevList: { key: Severity; label: string; tone: 'danger' | 'warning' | 'info' }[] = [
  { key: 'critical', label: 'Critical', tone: 'danger' },
  { key: 'warning', label: 'Warning', tone: 'warning' },
  { key: 'info', label: 'Info', tone: 'info' },
];
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border-subtle">
    <TextInput v-model="search" placeholder="Search events…" icon="search" class="flex-1 min-w-[160px]" />
    <div class="flex items-center gap-1.5">
      <BaseButton
        v-for="s in sevList"
        :key="s.key"
        size="sm"
        variant="ghost"
        :active="filter.severities.includes(s.key)"
        @click="activity.toggleSeverity(s.key)"
      >
        <BaseBadge :tone="s.tone" dot size="sm">{{ s.label }}</BaseBadge>
        <span class="ml-1 text-2xs text-content-muted tab-num">{{ counts[s.key] }}</span>
      </BaseButton>
    </div>
  </div>
</template>
