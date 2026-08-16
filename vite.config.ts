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
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    preview: {
      // Ensure direct URL access (e.g. /catalogo) falls back to index.html in preview mode
      // In production, configure the same rule on your hosting provider (Vercel/Netlify/etc.)
    },
    // ─── Vitest ──────────────────────────────────────────────────────────────
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/tests/setup.ts'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/tests/**', 'src/main.tsx', 'src/index.css'],
      },
    },
  };
});
