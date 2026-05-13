<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
  icon?: string;
}
withDefaults(defineProps<Props>(), { icon: '∅' });
</script>

<template>
  <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
    <div
      class="flex h-12 w-12 items-center justify-center rounded-full bg-surface-inset text-content-muted text-xl font-semibold"
      aria-hidden="true"
    >
      {{ icon }}
    </div>
    <h4 class="mt-3 text-sm font-semibold text-content-primary">{{ title }}</h4>
    <p v-if="description" class="mt-1 max-w-sm text-xs text-content-muted">
      {{ description }}
    </p>
    <slot />
  </div>
</template>
