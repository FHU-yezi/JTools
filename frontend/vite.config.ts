import Preact from "@preact/preset-vite";
import UnoCSS from "unocss/vite";
import { defineConfig } from "vite";
import compression from "vite-plugin-compression";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  build: {
    target: "es6",
  },
  plugins: [
    UnoCSS(),
    Preact(),
    VitePWA({
      injectRegister: "inline",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["favicon-64.ico", "favicon-180.png"],
      manifest: {
        name: "简书小工具集",
        short_name: "简书小工具集",
        description: "探索未知",
        lang: "zh-CN",
        dir: "ltr",
        theme_color: "#FFFFFF",
        icons: [
          {
            src: "favicon-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "favicon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
    // GZip
    compression({ threshold: 4096 }),
    // Brotli
    compression({
      algorithm: "brotliCompress",
      threshold: 4096,
      ext: ".br",
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8902",
      },
    },
  },
});
