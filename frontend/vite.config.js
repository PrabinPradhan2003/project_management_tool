import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:4000'
    }
  },
  // Use optimizeDeps.esbuildOptions to map .js => jsx for dependency pre-bundling.
  optimizeDeps: {
    esbuildOptions: {
      // Treat .js files as jsx so existing .js files with JSX parse correctly
      loader: { '.js': 'jsx' }
    }
  }
})
