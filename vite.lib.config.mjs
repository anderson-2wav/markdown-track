import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { isAbsolute } from "node:path";

// Library build for @2wav/markdown-track.
//
// Every third-party dependency is EXTERNALIZED (consumers install them; `vue`
// must stay a single instance) so `dist/` contains only this library's own code.
// Emits ESM + CJS + one extracted CSS file (dist/markdown-track.css).
//
// NB: this file is named `vite.lib.config.mjs` (not `vite.config.*`) on purpose —
// meteor-vite auto-discovers any nested `vite.config.*` in the app tree and it
// white-screens the whole app. See .private/CLAUDE.md.
export default defineConfig({
  plugins: [vue()],
  build: {
    cssCodeSplit: false,
    lib: {
      entry: "src/index.js",
      name: "MarkdownTrack",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "markdown-track.js" : "markdown-track.cjs"),
      cssFileName: "markdown-track",
    },
    rollupOptions: {
      // Externalize every bare import (node_modules); bundle only our own source
      // (relative, absolute, and Vite virtual `\0…` modules).
      external: (id) => !id.startsWith(".") && !id.startsWith("\0") && !isAbsolute(id),
    },
  },
});
