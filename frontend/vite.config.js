import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  build: {
    // Code splitting configuration for optimal performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries
          'vendor-react': ['react', 'react-router-dom', 'react-dom'],
          // Split page chunks
          'page-auth': ['./src/pages/Login.jsx', './src/pages/Signup.jsx'],
          'page-core': ['./src/pages/Home.jsx', './src/pages/Eventet.jsx'],
          'page-admin': ['./src/pages/AdminDashboard.jsx'],
          'page-account': ['./src/pages/Account.jsx'],
          'page-info': ['./src/pages/About.jsx', './src/pages/Socials.jsx'],
        },
        // Optimize chunk size
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]'
          } else if (/\.css$/.test(name ?? '')) {
            return 'css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    // Increase chunk size warning limit for larger chunks
    chunkSizeWarningLimit: 500,
  },
})
