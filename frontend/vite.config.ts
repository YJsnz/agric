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
    proxy: {
      '/api': process.env.VITE_API_TARGET || 'http://127.0.0.1:8081',
      '/multicrop': { target: 'http://127.0.0.1:5175', ws: true },
      // Keep the landing login and platform on one origin so auth storage is shared.
      '^/(?!platform(?:/|$)|api(?:/|$)|multicrop(?:/|$))': {
        target: 'http://127.0.0.1:5174',
        ws: true
      }
    },
    fs: { allow: ['..'] }
  }
})
