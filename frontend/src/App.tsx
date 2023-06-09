import { Suspense, lazy } from "preact/compat";
import { Route, Switch } from "wouter-preact";
import { routes } from "./Routes";
import Loading from "./components/Loading";
import ToolWrapper from "./components/ToolWrapper";
import MainPage from "./pages/MainPage";

const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <MainPage />
      </Route>
      {routes.map((item) => (
        <Route key={item.path} path={item.path}>
          <ToolWrapper
            toolName={item.toolName}
            Component={item.component}
          />
        </Route>
      ))}
      <Route>
        <Suspense fallback={<Loading />}>
          <NotFoundPage />
        </Suspense>
      </Route>
    </Switch>
  );
}
