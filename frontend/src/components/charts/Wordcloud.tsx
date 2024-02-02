import { useSignal } from "@preact/signals";
import clsx from "clsx";
import "echarts-wordcloud";
import type { GridComponentOption } from "echarts/components";
import { GridComponent } from "echarts/components";
import type { ComposeOption, EChartsType } from "echarts/core";
import { use as echartsUse } from "echarts/core";
import type { WordCloudSeriesOption } from "echarts/types/dist/echarts";
import { useRef } from "preact/hooks";
import {
  useAutoResize,
  useAutoUpdate,
  useDynamicColorScheme,
  useLoading,
} from "../../hooks/charts";

echartsUse([GridComponent]);

type OptionType = ComposeOption<WordCloudSeriesOption | GridComponentOption>;

interface Props {
  className: string;
  options: OptionType;
  loading?: boolean;
}

export default function WordCloud({
  className,
  options,
  loading = false,
}: Props) {
  const chartEl = useRef<HTMLDivElement>(null);
  const chartObj = useSignal<EChartsType | null>(null);

  useDynamicColorScheme({ chartObj, chartEl, options });
  useAutoResize({ chartObj, chartEl });
  useAutoUpdate({ chartObj, options });
  useLoading({ chartObj, options, loading });

  return <div className={clsx(className, "mx-auto")} ref={chartEl} />;
}
