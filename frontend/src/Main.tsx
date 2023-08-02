import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { install } from "resize-observer";
import { registerSW } from "virtual:pwa-register";

import { useLocalStorage } from "@mantine/hooks";
import React, { render, useEffect } from "preact/compat";
import App from "./App";
import ErrorFallback from "./components/ErrorFallback";
import Footer from "./components/Footer";

import "@unocss/reset/tailwind.css";
import "uno.css";

// 处理 Safari 浏览器上的 ResizeObserver 兼容性问题
if (!window.ResizeObserver) {
  install();
}

// 注册 PWA
registerSW({ immediate: true });

function Main() {
  const [colorScheme] = useLocalStorage<"light" | "dark">({
    key: "jtools-color-scheme",
    defaultValue: "light",
  });

  useEffect(() => {
    // UnoCSS 深色模式
    if (colorScheme === "dark") {
      document.documentElement.className = "dark";
    }
  }, [colorScheme]);

  return (
    <React.StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="mx-auto my-7 min-h-screen w-[90vw] max-w-4xl">
          <App />
        </div>
        <Footer />
      </ErrorBoundary>

      <Toaster
        toastOptions={{
          style: {
            background: colorScheme === "dark" ? "#3f3f46" : undefined,
            color: colorScheme === "dark" ? "#f4f4f5" : undefined,
          },

          blank: {
            duration: 2000,
          },
        }}
      />
    </React.StrictMode>
  );
}

render(<Main />, document.body);
