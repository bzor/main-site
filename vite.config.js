import { defineConfig } from 'vite';

export default defineConfig(({ command, mode }) => {
  return {
    build: {
      outDir: mode === 'production' ? 'docs/docs' : 'dist',
	  emptyOutDir: true
    },
    server: {
		host: '0.0.0.0', // Listen on all addresses
      open: true
    },
	base: './'
  };
});
