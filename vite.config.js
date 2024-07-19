import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  return {
    build: {
      outDir: mode === 'production' ? 'docs' : 'dist'
    },
    server: {
      open: true
    }
  };
});
