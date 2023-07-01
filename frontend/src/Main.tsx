import { Notifications } from "@mantine/notifications";
import { ErrorBoundary } from "react-error-boundary";
import { AiOutlineSearch } from "react-icons/ai";
import { install } from "resize-observer";

import {
  Box,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { SpotlightProvider } from "@mantine/spotlight";

import { useLocalStorage } from "@mantine/hooks";
import clsx from "clsx";
import React, { render, useEffect } from "preact/compat";
import App from "./App";
import ErrorFallback from "./components/ErrorFallback";
import { spotlightActions } from "./routes";

// 处理 Safari 浏览器上的 ResizeObserver 兼容性问题
if (!window.ResizeObserver) {
  install();
}

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
    // eslint-disable-next-line quotes
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
              <Box className="mx-auto my-7 w-[90vw] max-w-4xl">
                <App />
              </Box>
            </ErrorBoundary>
            <Notifications position="top-right" autoClose={2000} />
          </SpotlightProvider>
        </MantineProvider>
      </ColorSchemeProvider>
    </React.StrictMode>
  );
}

render(<Main />, document.body);
