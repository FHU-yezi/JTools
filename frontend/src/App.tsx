import { LoadingPage } from "@sscreator/ui";
import type { VNode } from "preact";
import { Suspense, lazy } from "preact/compat";
import type { RouteProps } from "wouter-preact";
import { Route, Switch } from "wouter-preact";
import ToolWrapper from "./components/ToolWrapper";
import MainPage from "./pages/MainPage";
import ThanksPage from "./pages/ThanksPage";
import V2UnavaliablePage from "./pages/V2UnavaliablePage";
import V2UnimplementedPage from "./pages/V2UnimplementedPage";
import { routes } from "./routes";

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <MainPage />
      </Route>
      {
        routes.map((item) => (
          <Route key={item.path} path={item.path}>
            <ToolWrapper toolName={item.toolName} Component={item.component} />
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
  );
}
