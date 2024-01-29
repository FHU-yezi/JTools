import { useSignal } from "@preact/signals";
import { useColorScheme } from "@sscreator/ui";
import clsx from "clsx";
import "echarts-wordcloud";
import type { GridComponentOption } from "echarts/components";
import { GridComponent } from "echarts/components";
import type { ComposeOption, EChartsType } from "echarts/core";
import { init as echartsInit, use as echartsUse } from "echarts/core";
import type { WordCloudSeriesOption } from "echarts/types/dist/echarts";
import { useEffect, useRef } from "preact/hooks";
import { getDefaultOptions, getLoadingConfig } from "./base";

echartsUse([GridComponent]);

type OptionType = ComposeOption<WordCloudSeriesOption | GridComponentOption>;

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

  const chartEl = useRef<HTMLDivElement>(null);
  const chartObj = useSignal<EChartsType | null>(null);
  const observer = new ResizeObserver(() => chartObj.value!.resize());

  const finalOptions: OptionType = {
    ...getDefaultOptions(Boolean(options.legend)),
    ...options,
  };

  // 挂载 / 颜色主题改变时时初始化图表
  useEffect(() => {
    if (chartObj.value) {
      chartObj.value.dispose();
    }
    chartObj.value = echartsInit(
      chartEl.current,
      colorScheme === "dark" ? "dark" : undefined,
    );
    chartObj.value.setOption(finalOptions);

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
    if (chartObj.value) {
      if (!dataReady) {
        chartObj.value.showLoading(getLoadingConfig(colorScheme));
      } else {
        chartObj.value.setOption(finalOptions);
        chartObj.value.hideLoading();
      }
    }
  }, [dataReady]);

  return <div className={clsx(className, "mx-auto")} ref={chartEl} />;
}