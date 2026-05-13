<script setup lang="ts" generic="T extends string">
interface Option<U extends string> {
  value: U;
  label: string;
}

const props = defineProps<{
  modelValue: T;
  options: Option<T>[];
  ariaLabel?: string;
  size?: 'sm' | 'md';
}>();
const emit = defineEmits<{ (e: 'update:modelValue', v: T): void }>();

function onChange(e: Event): void {
  emit('update:modelValue', (e.target as HTMLSelectElement).value as T);
}
</script>

<template>
  <div class="relative inline-block">
    <select
      :value="modelValue"
      :aria-label="ariaLabel"
      class="appearance-none rounded-lg border border-border-subtle bg-surface-raised pl-2.5 pr-7 text-xs text-content-primary focus:outline-none focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-accent/30"
      :class="size === 'md' ? 'h-9' : 'h-8'"
      @change="onChange"
    >
      <option v-for="opt in options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
    </select>
    <span
      class="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-content-muted text-2xs"
      aria-hidden="true"
      >▾</span
    >
  </div>
</template>
