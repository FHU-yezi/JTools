import { Route, Switch } from "wouter-preact";
import { routes } from "./Routes";
import ToolWrapper from "./components/ToolWrapper";
import MainPage from "./pages/MainPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Switch>
      <Route path="/">
        <MainPage />
      </Route>
      {routes.map((item) => (
        <Route path={item.path}>
          {<ToolWrapper toolName={item.toolName} Component={item.component} />}
        </Route>
      ))}
      <Route>
        <NotFoundPage />
      </Route>
    </Switch>
  );
}
