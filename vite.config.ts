import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base = '/OOP_FITNESS/' เมื่อ build เพื่อ GitHub Pages (ตำแหน่ง subpath ของ repo)
const base = process.env.GITHUB_PAGES ? '/OOP_FITNESS/' : '/';

export default defineConfig({
  base,
  plugins: [react()],
});