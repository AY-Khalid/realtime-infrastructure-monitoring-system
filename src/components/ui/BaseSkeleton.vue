<script setup lang="ts">
interface Props {
  height?: string;
  width?: string;
  rounded?: string;
}
withDefaults(defineProps<Props>(), {
  height: '1rem',
  width: '100%',
  rounded: 'rounded-md',
});
</script>

<template>
  <span
    class="skeleton block"
    :class="rounded"
    :style="{ height, width }"
    aria-hidden="true"
  />
</template>
