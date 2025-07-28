import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          animations: ['framer-motion'],
          icons: ['react-icons'],
          forms: ['react-select', 'react-color'],
          utils: ['file-saver', 'react-tooltip'],
          particles: ['tsparticles', '@tsparticles/react', 'react-tsparticles'],
          canvas: ['react-konva', 'react-rnd'],
          fonts: ['@fontsource/inter', '@fontsource/orbitron', '@fontsource/rajdhani']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 5173,
    host: true,
    open: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion'
    ]
  },
  css: {
    devSourcemap: false
  }
})
