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
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks
          'react-vendor': ['react', 'react-dom'],
          'react-router': ['react-router-dom'],
          
          // Animation and UI libraries
          'animations': ['framer-motion'],
          'icons': ['react-icons'],
          'ui-components': ['react-select', 'react-color', 'react-tooltip'],
          
          // Utility libraries
          'utils': ['file-saver', 'react-scroll'],
          
          // Specialized libraries
          'particles': ['tsparticles', '@tsparticles/react', 'react-tsparticles'],
          'canvas': ['react-konva', 'react-rnd'],
          'fonts': ['@fontsource/inter', '@fontsource/orbitron', '@fontsource/rajdhani'],
          
          // Country and image utilities
          'country-utils': ['react-country-flag'],
          'image-utils': ['use-image'],
          
          // Type animation
          'type-animation': ['react-type-animation']
        },
        // Optimize chunk naming for better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-[hash].js`;
        },
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      // External dependencies that shouldn't be bundled
      external: [],
    },
    chunkSizeWarningLimit: 1000,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Optimize dependencies
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
  server: {
    port: 5173,
    host: true,
    open: true,
    // Enable HMR for better development experience
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'react-icons',
      'react-select',
      'react-color',
      'react-tooltip',
      'file-saver',
      'react-scroll',
      'tsparticles',
      '@tsparticles/react',
      'react-tsparticles',
      'react-konva',
      'react-rnd',
      '@fontsource/inter',
      '@fontsource/orbitron',
      '@fontsource/rajdhani',
      'react-country-flag',
      'use-image',
      'react-type-animation'
    ],
    exclude: [],
  },
  // Enable experimental features for better performance
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: filename };
      } else {
        return { relative: true };
      }
    },
  },
  // Define global constants
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  // Optimize resolve for better module resolution
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@assets': '/src/assets',
      '@services': '/src/services',
    },
  },
})
