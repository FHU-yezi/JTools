import { useSignal } from "@preact/signals";
import { useColorScheme } from "@sscreator/ui";
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
import { init as echartsInit, use as echartsUse } from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useRef } from "preact/hooks";
import { getFinalOptions, getLoadingConfig } from "./base";

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
  dataReady?: boolean;
}

export default function BarChart({
  className,
  options,
  dataReady = true,
}: Props) {
  const { colorScheme } = useColorScheme();

  const chartEl = useRef<HTMLDivElement>(null);
  const chartObj = useSignal<EChartsType | null>(null);
  const observer = new ResizeObserver(() => chartObj.value!.resize());

  // 挂载 / 颜色主题改变时时初始化图表
  useEffect(() => {
    if (chartObj.value) {
      chartObj.value.dispose();
    }
    chartObj.value = echartsInit(
      chartEl.current,
      colorScheme === "dark" ? "dark" : undefined,
    );
    chartObj.value.setOption(getFinalOptions(options, !!options.legend));

    return () => {
      chartObj.value!.dispose();
    };
  }, [colorScheme]);

  // 使图表跟随页面缩放自动调整大小
  useEffect(() => {
    if (chartEl.current) {
      observer.observe(chartEl.current!);
    }

    return () => observer.unobserve(chartEl.current!);
  }, []);

  // 数据就绪状态变化时更改加载状态
  useEffect(() => {
    if (!dataReady) {
      chartObj.value?.showLoading(getLoadingConfig(colorScheme));
    } else {
      chartObj.value?.setOption(getFinalOptions(options, !!options.legend));
      chartObj.value?.hideLoading();
    }
  }, [dataReady]);

  // 数据变化时自动更新图表
  useEffect(
    () => chartObj.value?.setOption(getFinalOptions(options, !!options.legend)),
    [options],
  );

  return <div className={clsx(className, "mx-auto")} ref={chartEl} />;
}
