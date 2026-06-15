import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// Plain React + Module Federation remote (no TanStack Start / SSR). Runs as a
// standalone React app in dev (`vite`) and builds a federation remote exposing
// ./App for the host (eraplanner.com) to load at runtime. Federation is enabled
// only for the production build — its absolute base + HTML rewrites get in the
// way of the standalone dev server.
export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  const publicUrl = process.env.PUBLIC_URL || "https://castles.eraplanner.com/";
  const src = fileURLToPath(new URL("./src", import.meta.url));

  return {
    server: { port: 8089, cors: true },
    preview: { port: 8089, cors: true },
    // Absolute base lets the host load the remote's assets cross-origin; in dev
    // a relative base keeps the standalone server self-contained.
    base: isDev ? "/" : publicUrl,
    // `@/x` and `#/x` both resolve to `src/x` (matches the existing import style).
    resolve: {
      alias: [
        { find: /^@\//, replacement: `${src}/` },
        { find: /^#\//, replacement: `${src}/` },
      ],
    },
    optimizeDeps: { exclude: ["rxjs"] },
    plugins: [
      !isDev &&
        federation({
          name: "castles",
          filename: "remoteEntry.js",
          exposes: { "./App": "./src/App.tsx" },
          shared: {
            react: { singleton: true },
            "react-dom": { singleton: true },
            // Singleton so host and remote share one RxJS instance — required
            // for the globalThis-pinned castlesBus Subjects to work across the
            // boundary.
            rxjs: { singleton: true },
          },
        }),
      tailwindcss(),
      react(),
    ],
  };
});
