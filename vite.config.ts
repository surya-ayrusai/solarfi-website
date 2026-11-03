import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          about: path.resolve(__dirname, 'about-us.html'),
          contact: path.resolve(__dirname, 'contact-us.html'),
          design: path.resolve(__dirname, 'design-engineering.html'),
          procurement: path.resolve(__dirname, 'procurement.html'),
          installation: path.resolve(__dirname, 'installation-commissioning.html'),
          operations: path.resolve(__dirname, 'operations-maintenance.html'),
          ev: path.resolve(__dirname, 'ev-charging-battery-storage.html'),
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
