import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "$lib": resolve(root, "src/lib"),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: false,
    lib: {
      entry: resolve(root, "src/background.ts"),
      name: "GiteaMarkFilesReadBackground",
      formats: ["iife"],
      fileName: () => "background.js",
    },
  },
});
