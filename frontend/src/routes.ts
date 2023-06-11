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
    component: lazy(() => import("./pages/LPRecommendChecker")),
    path: "/LP-recommend-checker",
    toolName: "LP 理事会推文检测",
    description: "检测文章是否符合 LP 理事会推荐标准。",
  },
  {
    component: lazy(() => import("./pages/OnRankArticleViewer")),
    path: "/on-rank-article-viewer",
    toolName: "上榜文章查询",
    description: "查询文章上榜历史。",
  },
  {
    component: lazy(() => import("./pages/JPEPFTNMacketAnalyzer")),
    path: "/JPEP-FTN-market-analyzer",
    toolName: "商城贝市分析",
    description: "分析简书积分兑换平台贝市数据。",
  },
  {
    component: lazy(() => import("./pages/LotteryRewardRecordViewer")),
    path: "/lottery-reward-record-viewer",
    toolName: "简书大转盘中奖记录",
    description: "查询简书大转盘中奖记录。",
  },
  {
    component: lazy(() => import("./pages/LotteryAnalyzer")),
    path: "/lottery-analyzer",
    toolName: "简书大转盘分析",
    description: "分析简书大转盘中奖数据。",
  },
  {
    component: lazy(() => import("./pages/ArticlePublishTimeViewer")),
    path: "/article-publish-time-viewer",
    toolName: "文章发布时间查询",
    description: "查询文章的发布与更新时间。",
  },
  {
    component: lazy(() => import("./pages/ArticleWordcloudGenerator")),
    path: "/article-wordcloud-generator",
    toolName: "文章词云图",
    description: "生成文章词云图。",
  },
  {
    component: lazy(() => import("./pages/URLSchemeConvertor")),
    path: "/URL-scheme-convertor",
    toolName: "URL Scheme 转换",
    description: "将简书网页链接转换成 URL Scheme，以实现跳转 App 打开。",
  },
  {
    component: lazy(() => import("./pages/VIPInfoViewer")),
    path: "/VIP-info-viewer",
    toolName: "会员信息查询",
    description: "查询简书会员等级和过期时间。",
  },
];

export const spotlightActions: SpotlightAction[] = routes.map((item) => ({
  title: item.toolName,
  description: item.description,
  onTrigger: () => window.open(window.location.origin + item.path, "_self"),
}));
