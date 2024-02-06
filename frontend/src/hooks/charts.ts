import type { Signal } from "@preact/signals";
import { useColorScheme } from "@sscreator/ui";
import type { EChartsType } from "echarts/core";
import { init as echartsInit } from "echarts/core";
import type { Ref } from "preact/hooks";
import { useEffect } from "preact/hooks";
import { getFinalOptions, getLoadingConfig } from "../components/charts/base";

interface UseDynamicColorSchemeArgs {
  chartObj: Signal<EChartsType | null>;
  chartEl: Ref<HTMLDivElement>;
  options: Record<string, any>;
}

export function useDynamicColorScheme({
  chartObj,
  chartEl,
  options,
}: UseDynamicColorSchemeArgs) {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    chartObj.value = echartsInit(
      chartEl.current,
      colorScheme === "dark" ? "dark" : undefined,
    );
    chartObj.value.setOption(getFinalOptions(options, !!options.legend));

    return () => {
      chartObj.value?.dispose();
    };
  }, [colorScheme]);
}

interface UseAutoResizeArgs {
  chartObj: Signal<EChartsType | null>;
  chartEl: Ref<HTMLDivElement>;
}

export function useAutoResize({ chartObj, chartEl }: UseAutoResizeArgs) {
  const observer = new ResizeObserver(() => chartObj.value?.resize());

  useEffect(() => {
    if (chartEl.current) {
      observer.observe(chartEl.current);
    }

    return () => observer.unobserve(chartEl.current!);
  }, []);
}

interface UseLoadingArgs {
  chartObj: Signal<EChartsType | null>;
  options: Record<string, any>;
  loading: boolean;
}

interface UseAutoUpdateArgs {
  chartObj: Signal<EChartsType | null>;
  options: Record<string, any>;
}

export function useAutoUpdate({ chartObj, options }: UseAutoUpdateArgs) {
  useEffect(
    () => chartObj.value?.setOption(getFinalOptions(options, !!options.legend)),
    [options],
  );
}

export function useLoading({ chartObj, options, loading }: UseLoadingArgs) {
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (!chartObj.value) return;

    if (loading) {
      chartObj.value.showLoading(getLoadingConfig(colorScheme));
    } else {
      chartObj.value.setOption(getFinalOptions(options, !!options.legend));
      chartObj.value.hideLoading();
    }
  }, [loading]);
}
