<script setup lang="ts">
import { useTheme } from '@/composables/useTheme';
import BaseButton from '../ui/BaseButton.vue';
import Icon from '../ui/Icon.vue';
import Tooltip from '../ui/Tooltip.vue';

const { isDark, toggle } = useTheme();
</script>

<template>
  <Tooltip :label="isDark ? 'Switch to light' : 'Switch to dark'">
    <BaseButton size="sm" variant="ghost" icon-only @click="toggle">
      <Icon :name="isDark ? 'sun' : 'moon'" :size="14" />
    </BaseButton>
  </Tooltip>
</template>
