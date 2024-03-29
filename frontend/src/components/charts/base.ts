export function getDefaultOptions(hasLegend: boolean) {
  return {
    // 透明背景
    backgroundColor: "",
    // 移除边距
    grid: {
      top: hasLegend ? "15%" : 10,
      bottom: 0,
      left: 0,
      right: 0,
      containLabel: true,
    },
  };
}

export function getFinalOptions(
  options: Record<string, any>,
  hasLegend: boolean,
) {
  const defaultOptions = getDefaultOptions(hasLegend);
  return { ...defaultOptions, ...options };
}

export function getLoadingConfig(colorScheme: "light" | "dark") {
  return {
    text: "加载中",
    fontSize: 16,
    spinnerRadius: 10,
    lineWidth: 2,
    fontWeight: 600,
    color: colorScheme === "light" ? "rgb(9, 9, 11)" : "rgb(250, 250, 250)",
    textColor: colorScheme === "light" ? "rgb(9, 9, 11)" : "rgb(250, 250, 250)",
    maskColor:
      colorScheme === "light"
        ? "rgba(255, 255, 255, 0.8)"
        : "rgba(0, 0, 0, 0.7)",
  };
}
