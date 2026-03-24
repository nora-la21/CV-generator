import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({ include: ['buffer', 'process', 'stream', 'util', 'path'] }),
  ],
  base: process.env.NODE_ENV === 'production' ? '/CV-generator/' : '/',
  optimizeDeps: {
    include: ['pdfjs-dist'],
  },
})
