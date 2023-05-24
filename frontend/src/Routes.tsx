import Tool1 from "./pages/Tool1";
import Tool2 from "./pages/Tool2";
import Tool3 from "./pages/Tool3";

interface RouteItem {
  component: any;
  path: string;
  toolName: string;
}

export const routes: RouteItem[] = [
  {
    component: Tool1,
    path: "/tool1",
    toolName: "工具1",
  },
  {
    component: Tool2,
    path: "/tool2",
    toolName: "工具2",
  },
  {
    component: Tool3,
    path: "/tool3",
    toolName: "工具3",
  },
];
