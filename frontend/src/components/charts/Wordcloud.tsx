import { useSignal } from "@preact/signals";
import { useColorScheme } from "@sscreator/ui";
import clsx from "clsx";
import "echarts-wordcloud";
import { GridComponent } from "echarts/components";
import type { ComposeOption } from "echarts/core";
import * as echarts from "echarts/core";
import type { WordCloudSeriesOption } from "echarts/types/dist/echarts";
import { useEffect, useRef } from "preact/hooks";

echarts.use([GridComponent]);

type OptionType = ComposeOption<WordCloudSeriesOption>;

interface Props {
  className: string;
  options: OptionType;
  dataReady?: boolean;
}

export default function WordCloud({
  className,
  options,
  dataReady = true,
}: Props) {
  const { colorScheme } = useColorScheme();

  const chartObj = useSignal<echarts.ECharts | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  const observer = new ResizeObserver(() => chartObj.value!.resize());

  const finalOptions = {
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
    if (ref.current) {
      chartObj.value = echarts.init(ref.current);
      chartObj.value.setOption(finalOptions);
      observer.observe(ref.current);

      return () => {
        chartObj.value!.dispose();
        observer.unobserve(ref.current!);
      };
    }
  }, []);

  useEffect(() => {
    if (chartObj.value && ref.current) {
      chartObj.value.dispose();
      chartObj.value = echarts.init(
        ref.current,
        colorScheme === "dark" ? "dark" : undefined,
      );
      chartObj.value.setOption(finalOptions);
    }
  }, [colorScheme]);

  useEffect(() => {
    if (chartObj.value) {
      if (!dataReady) {
        chartObj.value.showLoading({
          text: "   加载中...",
          fontSize: 16,
          spinnerRadius: 15,
          lineWidth: 2,
          textColor: colorScheme === "dark" ? "#f4f4f5" : undefined,
          maskColor: colorScheme === "dark" ? "rgba(9, 9, 11, 0.8)" : undefined,
        });
      } else {
        chartObj.value.setOption(finalOptions);
        chartObj.value.hideLoading();
      }
    }
  }, [dataReady]);

  return <div className={clsx("w-full mx-auto", className)} ref={ref} />;
}
