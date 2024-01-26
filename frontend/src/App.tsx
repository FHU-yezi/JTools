import { LoadingPage } from "@sscreator/ui";
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
import PageWrapper from "./components/PageWrapper";
import MainPage from "./pages/MainPage";
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
  return (
    <StrictMode>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Switch>
          <Route path="/">
            <PageWrapper Component={MainPage} disableToolMetaInfo isMainPage />
          </Route>
          {
            routes.map((item) => (
              <Route key={item.path} path={item.path}>
                <PageWrapper
                  pageName={item.pageName}
                  Component={item.component}
                  disableToolMetaInfo={!item.isTool}
                  hideDecorations={item.hideDecorations}
                />
              </Route>
            )) as unknown as VNode<RouteProps<undefined, string>>
          }
          <Route>
            <Suspense fallback={<LoadingPage />}>
              <NotFoundPage />
            </Suspense>
          </Route>
        </Switch>

        <Toaster />
      </ErrorBoundary>
    </StrictMode>
  );
}

render(<Main />, document.body);
