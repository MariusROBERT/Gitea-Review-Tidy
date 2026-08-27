import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

const root = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [
    svelte(),
    tailwindcss(),
    {
      name: "classic-options-script",
      enforce: "post",
      transformIndexHtml(html) {
        return html.replace(
          '<script type="module" crossorigin src="./options.js"></script>',
          '<script defer src="./options.js"></script>',
        );
      },
    },
  ],
  resolve: {
    alias: {
      "$lib": resolve(root, "src/lib"),
    },
  },
  build: {
    rollupOptions: {
      input: {
        options: resolve(root, "index.html"),
      },
      output: {
        entryFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
});
