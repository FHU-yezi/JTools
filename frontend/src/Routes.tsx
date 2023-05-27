import ArticlePublishTimeViewer from "./pages/ArticlePublishTimeViewer";

export interface RouteItem {
  component: any;
  path: string;
  toolName: string;
  description: string;
}

export const routes: RouteItem[] = [
  {
    component: ArticlePublishTimeViewer,
    path: "/article_publish_time_viewer",
    toolName: "文章发布时间查询工具",
    description: "查询文章的发布与更新时间。",
  },
];
