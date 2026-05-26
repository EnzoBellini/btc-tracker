import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@trackion/billing": path.resolve(__dirname, "../../packages/billing/src/index.ts"),
    },
  },
  build: { outDir: "dist", emptyOutDir: true },
  server: {
    host: "127.0.0.1",
    port: 3001,
    strictPort: true,
    proxy: { "/api": { target: "http://127.0.0.1:5000", changeOrigin: true } },
  },
});
