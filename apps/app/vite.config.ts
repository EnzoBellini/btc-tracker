import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.png", "logo-trackion.png"],
      manifest: {
        name: "Trackion — Trading Journal",
        short_name: "Trackion",
        description: "Diário de trades crypto com sync de exchange, PnL e gestão de risco.",
        theme_color: "#1a1a1a",
        background_color: "#0a0a0a",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "./",
        start_url: "./#/",
        id: "./",
        lang: "pt-BR",
        categories: ["finance", "productivity"],
        icons: [
          { src: "icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "logo-trackion.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,webp}"],
        navigateFallback: "index.html",
        navigateFallbackDenylist: [/^\/api\//],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@trackion/billing": path.resolve(import.meta.dirname, "../../packages/billing/src/index.ts"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  base: "./",
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
