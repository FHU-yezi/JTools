// vite.config.ts
import preact from "file:///home/yezi/Documents/Python-Develop/JTools/frontend/node_modules/.pnpm/@preact+preset-vite@2.5.0_@babel+core@7.22.5_preact@10.15.1_vite@4.3.9/node_modules/@preact/preset-vite/dist/esm/index.mjs";
import { defineConfig } from "file:///home/yezi/Documents/Python-Develop/JTools/frontend/node_modules/.pnpm/vite@4.3.9/node_modules/vite/dist/node/index.js";
import compression from "file:///home/yezi/Documents/Python-Develop/JTools/frontend/node_modules/.pnpm/vite-plugin-compression@0.5.1_vite@4.3.9/node_modules/vite-plugin-compression/dist/index.mjs";
import { VitePWA } from "file:///home/yezi/Documents/Python-Develop/JTools/frontend/node_modules/.pnpm/vite-plugin-pwa@0.16.4_vite@4.3.9_workbox-build@7.0.0_workbox-window@7.0.0/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  build: {
    target: "es6"
  },
  plugins: [
    preact(),
    VitePWA({
      injectRegister: "inline",
      registerType: "autoUpdate",
      devOptions: {
        enabled: true
      },
      includeAssets: ["favicon-64.ico", "favicon-180.png"],
      manifest: {
        name: "\u7B80\u4E66\u5C0F\u5DE5\u5177\u96C6",
        short_name: "\u7B80\u4E66\u5C0F\u5DE5\u5177\u96C6",
        description: "\u63A2\u7D22\u672A\u77E5",
        theme_color: "#FFFFFF",
        icons: [
          {
            src: "favicon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "favicon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "favicon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ]
      }
    }),
    // GZip
    compression({ threshold: 4096 }),
    // Brotli
    compression({
      algorithm: "brotliCompress",
      threshold: 4096,
      ext: ".br"
    })
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8902"
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS95ZXppL0RvY3VtZW50cy9QeXRob24tRGV2ZWxvcC9KVG9vbHMvZnJvbnRlbmRcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIi9ob21lL3llemkvRG9jdW1lbnRzL1B5dGhvbi1EZXZlbG9wL0pUb29scy9mcm9udGVuZC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS95ZXppL0RvY3VtZW50cy9QeXRob24tRGV2ZWxvcC9KVG9vbHMvZnJvbnRlbmQvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgcHJlYWN0IGZyb20gXCJAcHJlYWN0L3ByZXNldC12aXRlXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IGNvbXByZXNzaW9uIGZyb20gXCJ2aXRlLXBsdWdpbi1jb21wcmVzc2lvblwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXM2XCIsXG4gIH0sXG4gIHBsdWdpbnM6IFtcbiAgICBwcmVhY3QoKSxcbiAgICBWaXRlUFdBKHtcbiAgICAgIGluamVjdFJlZ2lzdGVyOiBcImlubGluZVwiLFxuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgIGRldk9wdGlvbnM6IHtcbiAgICAgICAgZW5hYmxlZDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBpbmNsdWRlQXNzZXRzOiBbXCJmYXZpY29uLTY0Lmljb1wiLCBcImZhdmljb24tMTgwLnBuZ1wiXSxcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6IFwiXHU3QjgwXHU0RTY2XHU1QzBGXHU1REU1XHU1MTc3XHU5NkM2XCIsXG4gICAgICAgIHNob3J0X25hbWU6IFwiXHU3QjgwXHU0RTY2XHU1QzBGXHU1REU1XHU1MTc3XHU5NkM2XCIsXG4gICAgICAgIGRlc2NyaXB0aW9uOiBcIlx1NjNBMlx1N0QyMlx1NjcyQVx1NzdFNVwiLFxuICAgICAgICB0aGVtZV9jb2xvcjogXCIjRkZGRkZGXCIsXG4gICAgICAgIGljb25zOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgc3JjOiBcImZhdmljb24tMTkyLnBuZ1wiLFxuICAgICAgICAgICAgc2l6ZXM6IFwiMTkyeDE5MlwiLFxuICAgICAgICAgICAgdHlwZTogXCJpbWFnZS9wbmdcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJmYXZpY29uLTUxMi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6IFwiZmF2aWNvbi01MTIucG5nXCIsXG4gICAgICAgICAgICBzaXplczogXCI1MTJ4NTEyXCIsXG4gICAgICAgICAgICB0eXBlOiBcImltYWdlL3BuZ1wiLFxuICAgICAgICAgICAgcHVycG9zZTogXCJhbnlcIixcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHNyYzogXCJmYXZpY29uLTUxMi5wbmdcIixcbiAgICAgICAgICAgIHNpemVzOiBcIjUxMng1MTJcIixcbiAgICAgICAgICAgIHR5cGU6IFwiaW1hZ2UvcG5nXCIsXG4gICAgICAgICAgICBwdXJwb3NlOiBcIm1hc2thYmxlXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gICAgLy8gR1ppcFxuICAgIGNvbXByZXNzaW9uKHsgdGhyZXNob2xkOiA0MDk2IH0pLFxuICAgIC8vIEJyb3RsaVxuICAgIGNvbXByZXNzaW9uKHtcbiAgICAgIGFsZ29yaXRobTogXCJicm90bGlDb21wcmVzc1wiLFxuICAgICAgdGhyZXNob2xkOiA0MDk2LFxuICAgICAgZXh0OiBcIi5iclwiLFxuICAgIH0pLFxuICBdLFxuICBzZXJ2ZXI6IHtcbiAgICBwcm94eToge1xuICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgdGFyZ2V0OiBcImh0dHA6Ly9sb2NhbGhvc3Q6ODkwMlwiLFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJVLE9BQU8sWUFBWTtBQUM5VixTQUFTLG9CQUFvQjtBQUM3QixPQUFPLGlCQUFpQjtBQUN4QixTQUFTLGVBQWU7QUFFeEIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLEVBQ1Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxJQUNQLFFBQVE7QUFBQSxNQUNOLGdCQUFnQjtBQUFBLE1BQ2hCLGNBQWM7QUFBQSxNQUNkLFlBQVk7QUFBQSxRQUNWLFNBQVM7QUFBQSxNQUNYO0FBQUEsTUFDQSxlQUFlLENBQUMsa0JBQWtCLGlCQUFpQjtBQUFBLE1BQ25ELFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLE9BQU87QUFBQSxVQUNMO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsVUFDUjtBQUFBLFVBQ0E7QUFBQSxZQUNFLEtBQUs7QUFBQSxZQUNMLE9BQU87QUFBQSxZQUNQLE1BQU07QUFBQSxVQUNSO0FBQUEsVUFDQTtBQUFBLFlBQ0UsS0FBSztBQUFBLFlBQ0wsT0FBTztBQUFBLFlBQ1AsTUFBTTtBQUFBLFlBQ04sU0FBUztBQUFBLFVBQ1g7QUFBQSxVQUNBO0FBQUEsWUFDRSxLQUFLO0FBQUEsWUFDTCxPQUFPO0FBQUEsWUFDUCxNQUFNO0FBQUEsWUFDTixTQUFTO0FBQUEsVUFDWDtBQUFBLFFBQ0Y7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUVELFlBQVksRUFBRSxXQUFXLEtBQUssQ0FBQztBQUFBO0FBQUEsSUFFL0IsWUFBWTtBQUFBLE1BQ1YsV0FBVztBQUFBLE1BQ1gsV0FBVztBQUFBLE1BQ1gsS0FBSztBQUFBLElBQ1AsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFFBQVE7QUFBQSxJQUNOLE9BQU87QUFBQSxNQUNMLFFBQVE7QUFBQSxRQUNOLFFBQVE7QUFBQSxNQUNWO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
