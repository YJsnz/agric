import react from '@vitejs/plugin-react'

// 官网构建产物直接输出到 Spring Boot 静态目录根，
// 与 Vue 平台（static/platform/）同源部署：/ 官网、/platform/ 平台。
export default {
  plugins: [react()],
  build: {
    outDir: '../src/main/resources/static',
    // static 下还包含 /platform 与公共媒体，不能整体清空；入口使用稳定文件名避免残留旧 hash。
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index.js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]'
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 5174,
    // 开发环境把 /api 代理到本地后端，与生产同源部署保持一致
    proxy: { '/api': 'http://localhost:8080' },
    fs: { allow: ['..'] }
  }
}
