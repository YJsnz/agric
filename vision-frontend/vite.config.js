import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
export default defineConfig({base:'/multicrop/',plugins:[vue()],build:{outDir:'../src/main/resources/static/multicrop',emptyOutDir:true},server:{port:5175,strictPort:true,proxy:{'/api/multicrop':{target:'http://127.0.0.1:8081',timeout:250000,proxyTimeout:250000}}}})
