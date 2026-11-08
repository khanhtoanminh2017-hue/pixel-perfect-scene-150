import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  base: "/pixel-perfect-scene-150/",
  plugins: [
    // TanStack Start's <html>/<body> SSR shell must not mount inside the SPA root.
    // Transform only for the GitHub Pages build; leave Lovable SSR source intact.
    {
      name: "remove-ssr-shell-for-pages",
      enforce: "pre",
      transform(code, id) {
        if (id.replace(/\\/g, "/").endsWith("/src/routes/__root.tsx")) {
          return code.replace(/\s*shellComponent:\s*RootShell,/, "");
        }
      },
    },
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: { outDir: "dist", emptyOutDir: true },
});
