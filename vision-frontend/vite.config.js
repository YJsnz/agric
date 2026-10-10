import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({ plugins: [vue()], server: { port: 5175, strictPort: true, proxy: { '/api/jujube': { target: process.env.JUJUBE_API_TARGET || 'http://127.0.0.1:8093', changeOrigin: true, timeout: 420000, proxyTimeout: 420000 }, '/api/wheat': { target: process.env.WHEAT_API_TARGET || 'http://127.0.0.1:8092', changeOrigin: true, timeout: 420000, proxyTimeout: 420000 } } } })
