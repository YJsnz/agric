import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // 平台与官网同源部署：官网在 static 根（/），平台在此子路径（/platform/）
  base: '/platform/',
  plugins: [vue()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) }
  },
  build: {
    outDir: '../src/main/resources/static/platform',
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5173,
    proxy: { '/api': 'http://localhost:8081' },
    fs: { allow: ['..'] }
  }
})
