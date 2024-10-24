import { lazy } from "preact/compat";
import type { JSX } from "preact/jsx-runtime";

export interface RouteItem {
  component(): JSX.Element;
  path: string;
  pageName: string;
  description?: string;
  isTool?: boolean;
  hideDecorations?: boolean;
}

export const routes: RouteItem[] = [
  {
    component: lazy(() => import("./pages/ThanksPage")),
    path: "/thanks",
    pageName: "鸣谢",
    isTool: false,
  },
  {
    component: lazy(() => import("./pages/NoLongerAvailablePage")),
    path: "/no-longer-available",
    pageName: "已下线",
    isTool: false,
    hideDecorations: true,
  },
  {
    component: lazy(() => import("./pages/UnderDevelopmentPage")),
    path: "/under-development",
    pageName: "开发中",
    isTool: false,
    hideDecorations: true,
  },
  {
    component: lazy(() => import("./pages/LPRecommendChecker")),
    path: "/LP-recommend-checker",
    pageName: "LP 理事会推文检测",
    description: "检测文章是否符合 LP 理事会推荐标准",
  },
  {
    component: lazy(() => import("./pages/OnRankArticleViewer")),
    path: "/on-rank-article-viewer",
    pageName: "上榜文章查询",
    description: "查询文章上榜历史",
  },
  {
    component: lazy(() => import("./pages/JPEPFTNMacketAnalyzer")),
    path: "/JPEP-FTN-market-analyzer",
    pageName: "商城贝市分析",
    description: "分析简书积分兑换平台贝市数据",
  },
  {
    component: lazy(() => import("./pages/VIPProfitCompute")),
    path: "/VIP-profit-compute",
    pageName: "会员收益计算",
    description: "根据持钻量、创作收益等因素计算会员收益",
  },
  {
    component: lazy(() => import("./pages/LotteryRewardRecordViewer")),
    path: "/lottery-reward-record-viewer",
    pageName: "简书大转盘中奖记录",
    description: "查询简书大转盘中奖记录",
  },
  {
    component: lazy(() => import("./pages/LotteryAnalyzer")),
    path: "/lottery-analyzer",
    pageName: "简书大转盘分析",
    description: "分析简书大转盘中奖数据",
  },
  {
    component: lazy(() => import("./pages/ArticleWordcloudGenerator")),
    path: "/article-wordcloud-generator",
    pageName: "文章词云图",
    description: "生成文章词云图",
  },
  {
    component: lazy(() => import("./pages/URLSchemeConvertor")),
    path: "/URL-scheme-convertor",
    pageName: "URL Scheme 转换",
    description: "将简书网页链接转换成 URL Scheme，以实现跳转 App 打开",
  },
  {
    component: lazy(() => import("./pages/VIPInfoViewer")),
    path: "/VIP-info-viewer",
    pageName: "会员信息查询",
    description: "查询简书会员等级和过期时间",
  },
];

export const tools: RouteItem[] = routes.filter(
  (item) => item.isTool !== false,
);
