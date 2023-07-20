import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { AiOutlineSearch } from "react-icons/ai";
import { install } from "resize-observer";
import { registerSW } from "virtual:pwa-register";

import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { SpotlightProvider } from "@mantine/spotlight";

import { useLocalStorage } from "@mantine/hooks";
import React, { render, useEffect } from "preact/compat";
import App from "./App";
import ErrorFallback from "./components/ErrorFallback";
import { spotlightActions } from "./routes";

// 处理 Safari 浏览器上的 ResizeObserver 兼容性问题
if (!window.ResizeObserver) {
  install();
}

// 注册 PWA
registerSW({ immediate: true });

function Main() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "jtools-color-scheme",
    defaultValue: "light",
  });
  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");

    // Tailwind CSS 深色模式
    if (colorScheme === "dark") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  };

  useEffect(() => {
    // Tailwind CSS 深色模式
    if (localStorage.getItem("jtools-color-scheme") === '"dark"') {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <React.StrictMode>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider theme={{ colorScheme }}>
          <SpotlightProvider
            actions={spotlightActions}
            searchIcon={<AiOutlineSearch size="1.2rem" />}
            searchPlaceholder="查找小工具..."
            nothingFoundMessage="无结果"
          >
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <div className="mx-auto my-7 w-[90vw] max-w-4xl">
                <App />
              </div>
            </ErrorBoundary>
          </SpotlightProvider>
        </MantineProvider>
      </ColorSchemeProvider>

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
