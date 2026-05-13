<script setup lang="ts" generic="T extends string">
interface Option<U extends string> {
  value: U;
  label: string;
  hint?: string;
}

const props = defineProps<{
  modelValue: T;
  options: Option<T>[];
  size?: 'sm' | 'md';
  ariaLabel?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', v: T): void }>();

function select(v: T): void {
  if (v !== props.modelValue) emit('update:modelValue', v);
}
</script>

<template>
  <div
    role="tablist"
    :aria-label="ariaLabel"
    class="inline-flex items-center gap-0.5 rounded-lg border border-border-subtle bg-surface-inset p-0.5"
    :class="size === 'md' ? 'h-9' : 'h-8'"
  >
    <button
      v-for="opt in options"
      :key="opt.value"
      type="button"
      role="tab"
      :aria-selected="opt.value === modelValue"
      :title="opt.hint"
      class="inline-flex items-center justify-center rounded-md px-2.5 text-xs font-medium transition-colors duration-150 focus-ring"
      :class="[
        size === 'md' ? 'h-8' : 'h-7',
        opt.value === modelValue
          ? 'bg-surface-raised text-content-primary shadow-soft'
          : 'text-content-muted hover:text-content-primary',
      ]"
      @click="select(opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>
