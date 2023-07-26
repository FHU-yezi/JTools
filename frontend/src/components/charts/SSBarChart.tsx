import { useLocalStorage } from "@mantine/hooks";
import { useSignal } from "@preact/signals";
import clsx from "clsx";
import type { BarSeriesOption } from "echarts/charts";
import { BarChart } from "echarts/charts";
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

echarts.use([
  BarChart,
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

export default function SSBarChart({
  className,
  options,
  dataReady = true,
}: Props) {
  const [colorScheme] = useLocalStorage<"light" | "dark">({
    key: "jtools-color-scheme",
    defaultValue: "light",
  });
  const echartObject = useSignal<echarts.ECharts | undefined>(undefined);

  const chartDivRef = useRef<HTMLDivElement>(null);

  const observer = new ResizeObserver(() => echartObject.value!.resize());

  const optionsToApply = {
    ...options,
    // 透明背景
    backgroundColor: "",
    // 移除左右边距
    grid: {
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
        colorScheme === "dark" ? "dark" : undefined
      );
      echartObject.value.setOption(optionsToApply);
    }
  }, [colorScheme]);

  useEffect(() => {
    if (echartObject.value !== undefined) {
      if (!dataReady) {
        echartObject.value.showLoading({
          text: "   加载中...",
          fontSize: 16,
          spinnerRadius: 15,
          lineWidth: 2,
        });
      } else {
        echartObject.value.setOption(optionsToApply);
        echartObject.value.hideLoading();
      }
    }
  }, [dataReady]);

  return <div className={clsx(className, "mx-auto")} ref={chartDivRef} />;
}
