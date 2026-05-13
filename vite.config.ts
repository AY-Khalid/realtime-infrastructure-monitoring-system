import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'echarts-vendor': ['echarts', 'vue-echarts'],
          'table-vendor': ['@tanstack/vue-table'],
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
        },
      },
    },
  },
  optimizeDeps: {
    include: ['echarts', 'vue-echarts', '@tanstack/vue-table', 'zod'],
  },
});
