import "@unocss/reset/tailwind.css";
import { render, StrictMode } from "preact/compat";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { install } from "resize-observer";
import "uno.css";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import ErrorFallback from "./components/ErrorFallback";
import Footer from "./components/Footer";
import { useColorScheme } from "./utils/colorSchemeHelper";

import "@sscreator/ui/dist/sscreator-ui.css";

// 处理 Safari 浏览器上的 ResizeObserver 兼容性问题
if (!window.ResizeObserver) {
  install();
}

// 注册 PWA
registerSW({ immediate: true });

function Main() {
  const { colorScheme } = useColorScheme();

  return (
    <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="mx-auto my-7 max-w-4xl min-h-screen w-[90vw]">
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
    </StrictMode>
  );
}

render(<Main />, document.body);
