<script setup lang="ts">
import { ref } from 'vue';

interface Props {
  label: string;
  side?: 'top' | 'bottom';
}
withDefaults(defineProps<Props>(), { side: 'top' });

const show = ref(false);
</script>

<template>
  <span
    class="relative inline-flex"
    @mouseenter="show = true"
    @mouseleave="show = false"
    @focusin="show = true"
    @focusout="show = false"
  >
    <slot />
    <transition
      enter-active-class="transition-all duration-150"
      enter-from-class="opacity-0 translate-y-1"
      leave-active-class="transition-all duration-100"
      leave-to-class="opacity-0 translate-y-1"
    >
      <span
        v-if="show"
        role="tooltip"
        class="pointer-events-none absolute left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md bg-content-primary px-2 py-1 text-2xs font-medium text-content-inverse shadow-elevated"
        :class="side === 'top' ? 'bottom-full mb-1.5' : 'top-full mt-1.5'"
      >
        {{ label }}
      </span>
    </transition>
  </span>
</template>
