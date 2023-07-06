import type { VNode } from "preact";
import { Suspense, lazy } from "preact/compat";
import { Route, RouteProps, Switch } from "wouter-preact";
import Loading from "./components/Loading";
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
        <Suspense fallback={<Loading />}>
          <ThanksPage />
        </Suspense>
      </Route>
      <Route path="/v2-unimplemented">
        <Suspense fallback={<Loading />}>
          <V2UnimplementedPage />
        </Suspense>
      </Route>
      <Route path="/v2-unavaliable">
        <Suspense fallback={<Loading />}>
          <V2UnavaliablePage />
        </Suspense>
      </Route>
      <Route>
        <Suspense fallback={<Loading />}>
          <NotFoundPage />
        </Suspense>
      </Route>
    </Switch>
  );
}
