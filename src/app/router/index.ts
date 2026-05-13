import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';
import DashboardPage from '@/pages/DashboardPage.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: DashboardPage,
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/',
  },
];

export const router = createRouter({
  history: createWebHashHistory(),
  routes,
});
