<script setup lang="ts">
interface Props {
  size?: number | string;
  strokeWidth?: number;
}
withDefaults(defineProps<Props>(), { size: 16, strokeWidth: 1.75 });
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    :stroke-width="strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <slot />
  </svg>
</template>
