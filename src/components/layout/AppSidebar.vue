<script setup lang="ts">
import { useUiStore } from '@/stores/ui';
import { storeToRefs } from 'pinia';
import Icon from '../ui/Icon.vue';
import { APP_NAME, APP_TAGLINE } from '@/constants/app';

const ui = useUiStore();
const { sidebarOpen } = storeToRefs(ui);

const nav = [
  { key: 'overview', label: 'Overview', icon: 'chart', active: true },
  { key: 'infra', label: 'Infrastructure', icon: 'server' },
  { key: 'network', label: 'Network', icon: 'network' },
  { key: 'alerts', label: 'Alerts', icon: 'alert' },
  { key: 'security', label: 'Security', icon: 'shield' },
  { key: 'regions', label: 'Regions', icon: 'globe' },
  { key: 'logs', label: 'Logs', icon: 'layers' },
];
</script>

<template>
  <aside
    class="hidden border-r border-border-subtle bg-surface-raised/60 backdrop-blur transition-[width] duration-300 ease-out-expo md:flex md:shrink-0 md:flex-col"
    :class="sidebarOpen ? 'w-60' : 'w-[68px]'"
  >
    <div class="flex h-14 items-center gap-2.5 px-4 border-b border-border-subtle">
      <div
        class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-info text-accent-contrast shadow-glow"
      >
        <Icon name="zap" :size="16" />
      </div>
      <transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-100"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="sidebarOpen" class="min-w-0">
          <p class="truncate text-sm font-semibold tracking-tight">{{ APP_NAME }}</p>
          <p class="truncate text-2xs text-content-muted">{{ APP_TAGLINE }}</p>
        </div>
      </transition>
    </div>

    <nav class="flex-1 px-2 py-3">
      <ul class="space-y-0.5">
        <li v-for="item in nav" :key="item.key">
          <button
            type="button"
            class="group flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors duration-150 focus-ring"
            :class="
              item.active
                ? 'bg-accent-soft/70 text-accent'
                : 'text-content-secondary hover:bg-surface-inset hover:text-content-primary'
            "
          >
            <Icon :name="item.icon" :size="15" />
            <transition
              enter-active-class="transition-opacity duration-200"
              leave-active-class="transition-opacity duration-100"
              enter-from-class="opacity-0"
              leave-to-class="opacity-0"
            >
              <span v-if="sidebarOpen" class="truncate">{{ item.label }}</span>
            </transition>
          </button>
        </li>
      </ul>
    </nav>

    <div class="border-t border-border-subtle p-3">
      <transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-100"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <div v-if="sidebarOpen" class="rounded-lg border border-border-subtle bg-surface-inset/50 p-3">
          <p class="text-2xs font-semibold text-content-primary">Cluster overview</p>
          <p class="mt-1 text-2xs text-content-muted">7 regions · 42 nodes · live telemetry</p>
        </div>
      </transition>
    </div>
  </aside>
</template>
