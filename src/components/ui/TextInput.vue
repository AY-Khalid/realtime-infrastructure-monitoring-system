<script setup lang="ts">
import Icon from './Icon.vue';

interface Props {
  modelValue: string;
  placeholder?: string;
  ariaLabel?: string;
  icon?: string;
  size?: 'sm' | 'md';
}
const props = withDefaults(defineProps<Props>(), { size: 'sm' });
const emit = defineEmits<{ (e: 'update:modelValue', v: string): void }>();
</script>

<template>
  <label
    class="relative inline-flex items-center rounded-lg border border-border-subtle bg-surface-raised pl-2 pr-2 transition-colors focus-within:border-accent/60 focus-within:ring-2 focus-within:ring-accent/30"
    :class="size === 'md' ? 'h-9' : 'h-8'"
  >
    <Icon v-if="icon" :name="icon" :size="14" class="text-content-muted" />
    <input
      type="text"
      :value="modelValue"
      :placeholder="placeholder"
      :aria-label="ariaLabel"
      class="ml-1 w-full bg-transparent text-xs text-content-primary placeholder:text-content-muted focus:outline-none"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      type="button"
      class="ml-1 rounded p-0.5 text-content-muted hover:text-content-primary"
      aria-label="Clear"
      @click="emit('update:modelValue', '')"
    >
      <Icon name="close" :size="12" />
    </button>
  </label>
</template>
