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
import type { ComposeOption } from "echarts/core";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useRef } from "preact/hooks";
import { getLoadingConfig } from "./base";

echarts.use([
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

  const echartObject = useSignal<echarts.ECharts | undefined>(undefined);

  const chartDivRef = useRef<HTMLDivElement>(null);

  const observer = new ResizeObserver(() => echartObject.value!.resize());

  const optionsToApply = {
    ...options,
    // 透明背景
    backgroundColor: "",
    // 移除边距
    grid: {
      top: options.legend ? "15%" : 20,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true,
    },
  };

  useEffect(() => {
    if (echartObject.value === undefined && chartDivRef.current !== null) {
      echartObject.value = echarts.init(chartDivRef.current);
      echartObject.value.setOption(optionsToApply);
      observer.observe(chartDivRef.current);

      return () => {
        echartObject.value!.dispose();
        observer.unobserve(chartDivRef.current!);
      };
    }
  }, []);

  useEffect(() => {
    if (echartObject.value !== undefined && chartDivRef.current !== null) {
      echartObject.value.dispose();
      echartObject.value = echarts.init(
        chartDivRef.current,
        colorScheme === "dark" ? "dark" : undefined,
      );
      echartObject.value.setOption(optionsToApply);
    }
  }, [colorScheme]);

  useEffect(() => {
    if (echartObject.value !== undefined) {
      if (!dataReady) {
        echartObject.value.showLoading(getLoadingConfig(colorScheme));
      } else {
        echartObject.value.setOption(optionsToApply);
        echartObject.value.hideLoading();
      }
    }
  }, [dataReady]);

  return <div className={clsx(className, "mx-auto")} ref={chartDivRef} />;
}
