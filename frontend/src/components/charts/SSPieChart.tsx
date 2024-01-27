import { useSignal } from "@preact/signals";
import { useColorScheme } from "@sscreator/ui";
import clsx from "clsx";
import type { PieSeriesOption } from "echarts/charts";
import { PieChart } from "echarts/charts";
import type {
  LegendComponentOption,
  TooltipComponentOption,
} from "echarts/components";
import { LegendComponent, TooltipComponent } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import * as echarts from "echarts/core";
import { SVGRenderer } from "echarts/renderers";
import { useEffect, useRef } from "preact/hooks";

echarts.use([PieChart, LegendComponent, TooltipComponent, SVGRenderer]);

type OptionType = ComposeOption<
  PieSeriesOption | LegendComponentOption | TooltipComponentOption
>;

interface Props {
  className: string;
  options: OptionType;
  dataReady?: boolean;
}

export default function SSPieChart({
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
      top: "15%",
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
        echartObject.value.showLoading({
          text: "   加载中...",
          fontSize: 16,
          spinnerRadius: 15,
          lineWidth: 2,
          textColor: colorScheme === "dark" ? "#f4f4f5" : undefined,
          maskColor: colorScheme === "dark" ? "rgba(9, 9, 11, 0.8)" : undefined,
        });
      } else {
        echartObject.value.setOption(optionsToApply);
        echartObject.value.hideLoading();
      }
    }
  }, [dataReady]);

  return <div className={clsx(className, "mx-auto")} ref={chartDivRef} />;
}
