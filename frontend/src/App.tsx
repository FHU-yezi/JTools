import ToolWrapper from "./components/ToolWrapper";
import { Route, Switch } from "wouter-preact";
import NotFoundPage from "./pages/NotFoundPage";
import MainPage from "./pages/MainPage";
import { routes } from "./Routes";

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <MainPage />
      </Route>
      {routes.map((item) => (
        <Route path={item.path}>
          {<ToolWrapper toolName={item.toolName} component={item.component} />}
        </Route>
      ))}
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
