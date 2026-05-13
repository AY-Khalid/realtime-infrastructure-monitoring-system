<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { useConnectionStore } from '@/stores/connection';
import BaseButton from '../ui/BaseButton.vue';
import Icon from '../ui/Icon.vue';
import ThemeToggle from '../controls/ThemeToggle.vue';
import StreamControl from '../controls/StreamControl.vue';
import TimeRangePicker from '../controls/TimeRangePicker.vue';
import { formatDateTime } from '@/utils/format';
import { useNow } from '@/composables/useNow';
import { APP_NAME } from '@/constants/app';

interface Props {
  paused: boolean;
}
defineProps<Props>();
const emit = defineEmits<{ (e: 'toggle-stream'): void; (e: 'force-disconnect'): void }>();

const ui = useUiStore();
const connection = useConnectionStore();
const now = useNow(1000);
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border-subtle bg-surface-base/80 px-4 backdrop-blur-md"
  >
    <BaseButton variant="ghost" icon-only size="sm" class="md:hidden" @click="ui.toggleSidebar">
      <Icon name="menu" :size="16" />
    </BaseButton>
    <BaseButton variant="ghost" icon-only size="sm" class="hidden md:inline-flex" @click="ui.toggleSidebar">
      <Icon name="menu" :size="16" />
    </BaseButton>
    <div class="min-w-0 flex items-baseline gap-2">
      <h1 class="truncate text-sm font-semibold tracking-tight text-content-primary">
        Infrastructure Overview
      </h1>
      <span class="hidden text-2xs text-content-muted tab-num md:inline">{{ formatDateTime(now) }}</span>
    </div>

    <div class="ml-auto flex items-center gap-2">
      <div class="hidden lg:block">
        <TimeRangePicker />
      </div>
      <StreamControl
        :paused="paused"
        @toggle="emit('toggle-stream')"
        @disconnect="emit('force-disconnect')"
      />
      <ThemeToggle />
    </div>
  </header>
</template>
