import { Center, Skeleton } from "@mantine/core";
import { JSX } from "preact/jsx-runtime";
import SSScolllable from "./SSScollable";

interface Props {
  children: JSX.Element | (() => JSX.Element);
  show?: boolean;
  minWidth?: number;
  height?: number;
  chartType: "radial" | "pie";
  allowOverflow?: boolean;
}

export default function ChartWrapper({
  children,
  show = true,
  minWidth = undefined,
  height = undefined,
  chartType,
  allowOverflow = false,
}: Props) {
  if (!show) {
    return (
      <Skeleton
        h={
          height ??
          (chartType === "radial"
            ? (window.innerWidth * 0.9) / 2
            : window.innerWidth)
        }
      />
    );
  }

  if (allowOverflow) {
    return (
      <SSScolllable>
        <div style={{ minWidth, height }}>{children}</div>
      </SSScolllable>
    );
  }
  if (chartType === "pie") {
    return (
      <Center mx="auto" style={{ width: "100%", height, maxWidth: 384 }}>
        {children}
      </Center>
    );
  }
  return (
    <Center mx="auto" style={{ width: "100%", height, maxWidth: 512 }}>
      {children}
    </Center>
  );
}
