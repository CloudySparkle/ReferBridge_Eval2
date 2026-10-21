import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        home: resolve(__dirname, 'home.html'),
        dashboard_legacy: resolve(__dirname, 'dashboard.html'),
        network_legacy: resolve(__dirname, 'network.html'),
        requests_legacy: resolve(__dirname, 'requests.html'),
        beds_legacy: resolve(__dirname, 'beds.html'),
        profile_legacy: resolve(__dirname, 'profile.html'),
        analytics_legacy: resolve(__dirname, 'analytics.html'),
        signup_legacy: resolve(__dirname, 'signup.html')
      }
    }
  }
});
