import { LoadingPage, useColorScheme } from "@sscreator/ui";
import "@unocss/reset/tailwind.css";
import type { VNode } from "preact";
import { StrictMode, Suspense, lazy, render } from "preact/compat";
import { ErrorBoundary } from "react-error-boundary";
import { Toaster } from "react-hot-toast";
import { install } from "resize-observer";
import "uno.css";
import { registerSW } from "virtual:pwa-register";
import type { RouteProps } from "wouter-preact";
import { Route, Switch } from "wouter-preact";
import ErrorFallback from "./components/ErrorFallback";
import Footer from "./components/Footer";
import ToolWrapper from "./components/ToolWrapper";
import MainPage from "./pages/MainPage";
import ThanksPage from "./pages/ThanksPage";
import V2UnavaliablePage from "./pages/V2UnavaliablePage";
import V2UnimplementedPage from "./pages/V2UnimplementedPage";
import { routes } from "./routes";

import "@sscreator/ui/dist/sscreator-ui.css";

// 处理 Safari 浏览器上的 ResizeObserver 兼容性问题
if (!window.ResizeObserver) {
  install();
}

// 注册 PWA
registerSW({ immediate: true });

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function Main() {
  const { colorScheme } = useColorScheme();

  return (
    <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <div className="mx-auto my-7 max-w-4xl min-h-screen w-[90vw]">
          <Switch>
            <Route path="/">
              <MainPage />
            </Route>
            {
              routes.map((item) => (
                <Route key={item.path} path={item.path}>
                  <ToolWrapper
                    toolName={item.toolName}
                    Component={item.component}
                  />
                </Route>
              )) as unknown as VNode<RouteProps<undefined, string>>
            }
            <Route path="/thanks">
              <Suspense fallback={<LoadingPage />}>
                <ThanksPage />
              </Suspense>
            </Route>
            <Route path="/v2-unimplemented">
              <Suspense fallback={<LoadingPage />}>
                <V2UnimplementedPage />
              </Suspense>
            </Route>
            <Route path="/v2-unavaliable">
              <Suspense fallback={<LoadingPage />}>
                <V2UnavaliablePage />
              </Suspense>
            </Route>
            <Route>
              <Suspense fallback={<LoadingPage />}>
                <NotFoundPage />
              </Suspense>
            </Route>
          </Switch>
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
