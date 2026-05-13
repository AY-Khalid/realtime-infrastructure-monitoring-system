<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  title?: string;
  subtitle?: string;
  padded?: boolean;
  glow?: boolean;
  as?: keyof HTMLElementTagNameMap;
}

const props = withDefaults(defineProps<Props>(), {
  padded: true,
  glow: false,
  as: 'section',
});

const padClass = computed(() => (props.padded ? 'p-5' : ''));
</script>

<template>
  <component
    :is="as"
    class="surface-card group relative overflow-hidden transition-shadow duration-300"
    :class="[glow ? 'shadow-elevated' : 'hover:shadow-elevated']"
  >
    <header
      v-if="title || $slots.header"
      class="flex items-start justify-between gap-3 px-5 pt-5 pb-3"
    >
      <div class="min-w-0">
        <h3 v-if="title" class="text-sm font-semibold tracking-tight text-content-primary">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="mt-0.5 text-xs text-content-muted">{{ subtitle }}</p>
        <slot name="header" />
      </div>
      <div class="shrink-0">
        <slot name="actions" />
      </div>
    </header>
    <div :class="padClass">
      <slot />
    </div>
    <slot name="footer" />
  </component>
</template>
