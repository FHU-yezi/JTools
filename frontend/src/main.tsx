import axios from "axios";

import { Notifications } from "@mantine/notifications";
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "./components/ErrorFallback";

import {
  Box,
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useLocalStorage } from "@mantine/hooks";
import React, { render } from "preact/compat";
import App from "./App";
import { getBaseURL } from "./utils";

axios.defaults.baseURL = getBaseURL() + "/api";
axios.defaults.timeout = 3000;
axios.defaults.maxRedirects = 0;

function Main() {
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: "jtools-color-scheme",
    defaultValue: "light",
  });
  const toggleColorScheme = () =>
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  return (
    <React.StrictMode>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider theme={{ colorScheme }} withGlobalStyles>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Box mx="auto" mih="100vh" w="90vw" mt={28} maw={896}>
              <App />
            </Box>
          </ErrorBoundary>
          <Notifications position="top-right" autoClose={2000} />
        </MantineProvider>
      </ColorSchemeProvider>
    </React.StrictMode>
  );
}

render(<Main />, document.body);