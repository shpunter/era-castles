import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { federation } from "@module-federation/vite";

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  const publicUrl = process.env.PUBLIC_URL ?? "https://castles.eraplanner.com/";

  return {
    server: { port: 8089, cors: true },
    preview: { port: 8089, cors: true },
    base: isDev ? "/" : publicUrl,
    resolve: { tsconfigPaths: true },
    optimizeDeps: { exclude: ["rxjs"] },
    ssr: { optimizeDeps: { exclude: ["rxjs"] } },
    plugins: [
      !isDev &&
        federation({
          name: "castles",
          filename: "remoteEntry.js",
          exposes: { "./App": "./src/App.tsx" },
          shared: {
            react: { singleton: true },
            "react-dom": { singleton: true },
            rxjs: { singleton: true },
          },
        }),
      devtools(),
      cloudflare({ viteEnvironment: { name: "ssr" } }),
      tailwindcss(),
      tanstackStart(),
      viteReact(),
    ],
  };
});
