import preact from "@preact/preset-vite";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";

export default defineConfig({
  build: {
    target: "es6",
  },
  plugins: [
    preact(),
    // GZip
    compression({ threshold: 4096 }),
    // Brotli
    compression({
      algorithm: "brotliCompress",
      threshold: 4096,
      ext: ".br",
    }),
  ],
});
