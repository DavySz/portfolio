import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: "dist/bundle-analysis.html",
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@hooks": "/src/hooks",
      "@pages": "/src/pages",
      "@shared": "/src/shared",
      "@assets": "/src/assets",
    },
  },
  build: {
    // Target modern browsers
    target: "esnext",
    // Enable minification
    minify: "esbuild",
    // Source maps for production debugging (can be disabled in production)
    sourcemap: false,
    // Optimize CSS
    cssMinify: true,
    // Rollup options
    rollupOptions: {
      output: {
        // Manual chunks for better caching
        manualChunks: {
          vendor: ["react", "react-dom"],
          i18n: ["i18next", "react-i18next"],
          icons: ["react-icons"],
          utils: ["clsx"],
        },
        // Asset file naming
        assetFileNames: "assets/[name].[hash][extname]",
        chunkFileNames: "chunks/[name].[hash].js",
        entryFileNames: "entries/[name].[hash].js",
      },
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Report compressed size
    reportCompressedSize: true,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "i18next", "react-i18next", "clsx"],
  },
  // Server configuration
  server: {
    port: 3000,
    open: true,
  },
  // Preview configuration
  preview: {
    port: 3000,
  },
});
