import { createApp } from 'vue';
import App from './App.vue';
import { router } from './app/router';
import { createAppPinia } from './app/providers';
import './assets/styles.css';

const app = createApp(App);
app.use(createAppPinia());
app.use(router);

// Surface unhandled errors in dev — we still rely on <ErrorBoundary /> for UX.
if (import.meta.env.DEV) {
  app.config.errorHandler = (err, _instance, info) => {
    // eslint-disable-next-line no-console
    console.error('[vue:error]', info, err);
  };
}

app.mount('#app');
