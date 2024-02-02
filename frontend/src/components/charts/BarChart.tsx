import { useSignal } from "@preact/signals";
import clsx from "clsx";
import type { BarSeriesOption } from "echarts/charts";
import { BarChart as EchartsBarChart } from "echarts/charts";
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import {
  GridComponent,
  LegendComponent,
  TooltipComponent,
} from "echarts/components";
import type { ComposeOption, EChartsType } from "echarts/core";
import { use as echartsUse } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useRef } from "preact/hooks";
import {
  useDynamicColorScheme,
  useAutoResize,
  useAutoUpdate,
  useLoading,
} from "../../hooks/charts";

echartsUse([
  EchartsBarChart,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  SVGRenderer,
]);

type OptionType = ComposeOption<
  | BarSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | TooltipComponentOption
>;

interface Props {
  className: string;
  options: OptionType;
  loading?: boolean;
}

export default function BarChart({
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
