import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],

  preview: {
    host: "0.0.0.0",
    allowedHosts: [".up.railway.app"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),

      // shared components globales
      "@shared": path.resolve(__dirname, "src/shared"),
      "@shared-components": path.resolve(
        __dirname,
        "src/shared/components"
      ),

      // capa común UI (si es tu design system)
      "@ui": path.resolve(__dirname, "src/shared/components"),

      // librerías internas
      "@lib": path.resolve(__dirname, "src/lib"),

      // hooks globales
      "@hooks": path.resolve(__dirname, "src/hooks"),

      // utils dentro de lib
      "@utils": path.resolve(__dirname, "src/lib/utils"),
    },
  },
});
