import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type PreviewOptions, type ServerOptions } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const serverOptions: ServerOptions | PreviewOptions = {
  host: true,
  port: 3000,
  strictPort: true,
  allowedHosts: ["localhost"],
  //Works in same manner as nginx reverse proxy that is setup for prod
  proxy: {
    "/api": {
      target: "http:/localhost:3001",
      changeOrigin: true,
      rewrite: (p) => p.replace(/^\/api\/?/, "/") || "/",
    },
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@meeting-calendar/shared": path.resolve(
        __dirname,
        "../../packages/shared/src/index.ts",
      ),
    },
  },
  server: serverOptions,
  preview: serverOptions,
});
