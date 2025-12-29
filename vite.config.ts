import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Manual chunking strategy:
        // - Separates large vendor libraries into their own chunks for better caching
        // - React/React-DOM: Frequently updated, separate chunk allows independent caching
        // - React Router: Stable but large, benefits from separate chunk
        // - React Table: Large library, separate chunk reduces main bundle size
        // - React Tooltip: Small but separate for modularity
        // - Other vendors: Grouped together for smaller libraries
        manualChunks: (id) => {
          // Split node_modules into separate chunks
          if (id.includes('node_modules')) {
            // Check most specific packages first to avoid matching broader patterns

            // React Table (most specific - includes @tanstack scope)
            if (id.includes('@tanstack/react-table')) {
              return 'table-vendor';
            }
            // React Router (check before generic 'react' to avoid false match)
            if (id.includes('react-router')) {
              return 'router-vendor';
            }
            // React Tooltip (check before generic 'react' to avoid false match)
            if (id.includes('react-tooltip')) {
              return 'tooltip-vendor';
            }
            // React DOM (check before generic 'react' to avoid false match)
            if (id.includes('react-dom')) {
              return 'react-vendor';
            }
            // React core (match /react/ or \react\ in path, but not react-router, react-tooltip, etc.)
            // Use regex to match node_modules/react/ but not node_modules/react-xxx/
            if (/node_modules[\\/]react[\\/]/.test(id) || /node_modules[\\/]react$/.test(id)) {
              return 'react-vendor';
            }
            // Other vendor code
            return 'vendor';
          }
        },
      },
    },
  },
  base: '/',
})
