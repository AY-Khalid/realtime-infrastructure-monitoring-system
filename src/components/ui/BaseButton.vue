<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/utils/cn';

interface Props {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  iconOnly?: boolean;
  disabled?: boolean;
  active?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  type: 'button',
  iconOnly: false,
  disabled: false,
  active: false,
});

const variantClass = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-accent text-accent-contrast hover:opacity-90 active:opacity-95 shadow-soft';
    case 'danger':
      return 'bg-danger/90 text-content-inverse hover:bg-danger';
    case 'ghost':
      return 'bg-transparent text-content-secondary hover:bg-surface-inset hover:text-content-primary';
    case 'secondary':
    default:
      return 'bg-surface-raised text-content-secondary border border-border-subtle hover:border-border hover:text-content-primary';
  }
});

const sizeClass = computed(() => {
  if (props.iconOnly) {
    return props.size === 'sm' ? 'h-7 w-7' : props.size === 'lg' ? 'h-10 w-10' : 'h-8 w-8';
  }
  return props.size === 'sm'
    ? 'h-7 px-2.5 text-xs'
    : props.size === 'lg'
      ? 'h-10 px-4 text-sm'
      : 'h-8 px-3 text-xs';
});

const activeClass = computed(() =>
  props.active
    ? 'ring-1 ring-accent/60 bg-accent-soft/60 text-content-primary border-accent/40'
    : '',
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="
      cn(
        'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-all duration-150 focus-ring',
        'disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]',
        variantClass,
        sizeClass,
        activeClass,
      )
    "
  >
    <slot />
  </button>
</template>
