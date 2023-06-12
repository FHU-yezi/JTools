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
import React, { render } from "preact/compat";
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
  const toggleColorScheme = () => setColorScheme(colorScheme === "dark" ? "light" : "dark");
  return (
    <React.StrictMode>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider theme={{ colorScheme }} withGlobalStyles>
          <SpotlightProvider
            actions={spotlightActions}
            searchIcon={<AiOutlineSearch size="1.2rem" />}
            searchPlaceholder="查找小工具..."
            nothingFoundMessage="无结果"
          >
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <Box mx="auto" w="90vw" my={28} maw={896}>
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