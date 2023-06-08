import type { SpotlightAction } from "@mantine/spotlight";
import { lazy } from "preact/compat";
import { JSX } from "preact/jsx-runtime";

export interface RouteItem {
  component: () => JSX.Element;
  path: string;
  toolName: string;
  description: string;
}

export const routes: RouteItem[] = [
  {
    component: lazy(() => import("./pages/ArticlePublishTimeViewer")),
    path: "/article_publish_time_viewer",
    toolName: "文章发布时间查询工具",
    description: "查询文章的发布与更新时间。",
  },
  {
    component: lazy(() => import("./pages/LotteryRewardRecordViewer")),
    path: "/lottery_reward_record_viewer",
    toolName: "简书大转盘中奖记录",
    description: "查询简书大转盘中奖记录。",
  },
  {
    component: lazy(() => import("./pages/OnRankArticleViewer")),
    path: "/on_rank_article_viewer",
    toolName: "上榜文章查询工具",
    description: "查询文章上榜历史。",
  },
  {
    component: lazy(() => import("./pages/URLSchemeConvertor")),
    path: "/url_scheme_convertor",
    toolName: "URL Scheme 转换工具",
    description: "将简书网页链接转换成 URL Scheme，以实现跳转 App 打开。",
  },
  {
    component: lazy(() => import("./pages/VIPInfoViewer")),
    path: "/VIP_info_viewer",
    toolName: "会员信息查询工具",
    description: "查询简书会员等级和过期时间。",
  },
  {
    component: lazy(() => import("./pages/LotteryAnalyzer")),
    path: "/lottery_analyzer",
    toolName: "抽奖分析工具",
    description: "分析简书大转盘中奖数据。",
  },
];

export const spotlightActions: SpotlightAction[] = routes.map((item) => ({
  title: item.toolName,
  description: item.description,
  onTrigger: () => window.open(window.location.origin + item.path, "_self"),
}));
