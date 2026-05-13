<script setup lang="ts">
interface Props {
  modelValue: boolean;
  size?: 'sm' | 'md';
  label?: string;
}
const props = withDefaults(defineProps<Props>(), { size: 'sm' });
const emit = defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

function toggle(): void {
  emit('update:modelValue', !props.modelValue);
}
</script>

<template>
  <button
    type="button"
    role="switch"
    :aria-checked="modelValue"
    :aria-label="label ?? 'Toggle'"
    class="relative inline-flex items-center rounded-full border border-border-subtle transition-colors duration-200 focus-ring"
    :class="[
      size === 'md' ? 'h-6 w-11' : 'h-5 w-9',
      modelValue ? 'bg-accent border-accent' : 'bg-surface-inset',
    ]"
    @click="toggle"
  >
    <span
      class="absolute left-0.5 rounded-full bg-surface-raised shadow-soft transition-transform duration-200 ease-out-expo"
      :class="[
        size === 'md' ? 'h-5 w-5' : 'h-4 w-4',
        modelValue ? (size === 'md' ? 'translate-x-5' : 'translate-x-4') : 'translate-x-0',
      ]"
    />
  </button>
</template>
