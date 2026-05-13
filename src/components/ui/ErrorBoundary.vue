<script setup lang="ts">
import { onErrorCaptured, ref } from 'vue';
import BaseButton from './BaseButton.vue';
import Icon from './Icon.vue';

const error = ref<Error | null>(null);

onErrorCaptured((err) => {
  error.value = err instanceof Error ? err : new Error(String(err));
  // Returning false prevents the error from propagating further.
  return false;
});

function retry(): void {
  error.value = null;
}
</script>

<template>
  <slot v-if="!error" />
  <div
    v-else
    role="alert"
    class="m-6 flex flex-col items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft/40 p-5 text-sm"
  >
    <div class="flex items-center gap-2 text-danger">
      <Icon name="alert" :size="16" />
      <span class="font-semibold">Something went wrong rendering this view.</span>
    </div>
    <code class="block max-w-full overflow-auto rounded-md bg-surface-inset px-3 py-2 font-mono text-2xs text-content-secondary">
      {{ error.message }}
    </code>
    <BaseButton size="sm" variant="primary" @click="retry">
      <Icon name="refresh" :size="13" />
      Try again
    </BaseButton>
  </div>
</template>
