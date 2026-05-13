<script setup lang="ts">
import { RouterView } from 'vue-router';
import ErrorBoundary from '@/components/ui/ErrorBoundary.vue';
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>
