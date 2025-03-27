import { defineConfig } from 'vite';

export default defineConfig({
  assetsInclude: ['**/*.html'],
  server: {
    port: 4200,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      '@root': '/src',
      '@components': '/src/components',
      '@systems': '/src/systems',
    },
  },
});
