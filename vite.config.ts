import { defineConfig } from 'vite';
import Sitemap from 'vite-plugin-sitemap';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), Sitemap({ hostname: 'https://nice-advice.info' })],
});
