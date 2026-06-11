import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { marketTickerDevPlugin } from "./vite-market-ticker";

export default defineConfig({
  plugins: [react(), tailwindcss(), marketTickerDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  server: {
    host: "127.0.0.1",
    port: 3000,
    strictPort: true,
    open: false,
    proxy: {
      // trial-signup e demais rotas do app — requer `npm run dev` em apps/app (porta 5000)
      "/api/trial-signup": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/api/affiliates": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
      "/api/auth": {
        target: "http://127.0.0.1:5000",
        changeOrigin: true,
      },
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
});
