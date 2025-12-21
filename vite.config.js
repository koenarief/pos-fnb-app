import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from "vite-plugin-pwa"; // Impor plugin

// https://vite.dev/config/
export default defineConfig({
  build: {
    // Mengatur batas peringatan ukuran chunk menjadi 1000 kB (1MB).
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
	react(),
	tailwindcss(),
    VitePWA({
      registerType: "autoUpdate", // Mengatur bagaimana Service Worker didaftarkan dan diperbarui
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"], // Aset statis yang akan di-cache
      manifest: {
        name: "DeKasir",
        short_name: "DeKasir",
        description: "Aplikasi untuk input data penjualan",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
})
