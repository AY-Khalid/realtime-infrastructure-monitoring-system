<script setup lang="ts">
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppHeader from '@/components/layout/AppHeader.vue';

defineProps<{ paused: boolean }>();
const emit = defineEmits<{ (e: 'toggle-stream'): void; (e: 'force-disconnect'): void }>();
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <AppSidebar />
    <div class="flex min-w-0 flex-1 flex-col">
      <AppHeader
        :paused="paused"
        @toggle-stream="emit('toggle-stream')"
        @force-disconnect="emit('force-disconnect')"
      />
      <main class="flex-1 overflow-auto bg-surface-base">
        <slot />
      </main>
    </div>
  </div>
</template>
