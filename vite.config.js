import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Library build for @2wav/markdown-track.
// `vue` is externalized so the consuming app provides the single Vue instance
// (a bundled second copy would break reactivity). Emits ESM + UMD + extracted CSS.
export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: "src/index.js",
      name: "MarkdownTrack",
      formats: ["es", "umd"],
      fileName: (format) => (format === "es" ? "markdown-track.js" : "markdown-track.umd.cjs"),
      cssFileName: "markdown-track"
    },
    rollupOptions: {
      external: ["vue"],
      output: {
        globals: { vue: "Vue" }
      }
    }
  }
});
