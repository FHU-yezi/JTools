import { LoadingPage } from "@sscreator/ui";
import { render, type VNode } from "preact";
import { lazy, Suspense } from "preact/compat";
import { Toaster } from "react-hot-toast";
import { install } from "resize-observer";
import { SWRConfig } from "swr";
import { registerSW } from "virtual:pwa-register";
import { Route, Switch } from "wouter-preact";
import ErrorFallback from "./components/ErrorFallback";
import PageWrapper from "./components/PageWrapper";
import MainPage from "./pages/MainPage";
import { routes } from "./routes";
import { onError } from "./utils/errorHandler";
import { fetcher } from "./utils/fetcher";

import "@sscreator/ui/sscreator-ui.css";
import "@unocss/reset/tailwind.css";
import "uno.css";

// 处理 Safari 浏览器上的 ResizeObserver 兼容性问题
if (!window.ResizeObserver) {
  install();
}

// 注册 PWA
registerSW({ immediate: true });

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <ErrorFallback>
      <SWRConfig
        value={{
          fetcher,
          shouldRetryOnError: false,
          onError,
        }}
      >
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
                  disableToolMetaInfo={
                    item.isTool !== undefined ? !item.isTool : false
                  }
                  hideDecorations={item.hideDecorations}
                />
              </Route>
            )) as unknown as VNode
          }
          <Route>
            <Suspense fallback={<LoadingPage />}>
              <NotFoundPage />
            </Suspense>
          </Route>
        </Switch>
      </SWRConfig>

      <Toaster />
    </ErrorFallback>
  );
}

render(<App />, document.body);
