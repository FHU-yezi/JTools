import { useLocalStorage } from "@mantine/hooks";
import { useSignal } from "@preact/signals";
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
  const [colorScheme] = useLocalStorage<"light" | "dark">({
    key: "jtools-color-scheme",
    defaultValue: "light",
  });
  const echartObject = useSignal<echarts.ECharts | undefined>(undefined);

  const chartDivRef = useRef<HTMLDivElement>(null);

  const observer = new ResizeObserver(() => echartObject.value!.resize());

  useEffect(() => {
    if (echartObject.value === undefined && chartDivRef.current !== null) {
      echartObject.value = echarts.init(chartDivRef.current);
      // 透明背景
      echartObject.value.setOption({ ...options, backgroundColor: "" });
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
      // 透明背景
      echartObject.value.setOption({ ...options, backgroundColor: "" });
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
        echartObject.value.setOption(options);
        echartObject.value.hideLoading();
      }
    }
  }, [dataReady]);

  return <div className={className} ref={chartDivRef} />;
}
