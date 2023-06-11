import { Center, Skeleton } from "@mantine/core";
import { JSX } from "preact/jsx-runtime";
import JMFScolllable from "./JMFScollable";

interface Props {
    children: JSX.Element | (() => JSX.Element)
    show?: boolean;
    minWidth?: number
    height?: number;
    chartType: "radial" | "pie";
    allowOverflow?: boolean
}

export default function ChartWrapper({
  children, show = true, minWidth = undefined, height = undefined, chartType, allowOverflow = false,
}: Props) {
  if (!show) {
    return (
      <Skeleton
        h={height ?? (chartType === "radial" ? (window.innerWidth * 0.9) / 2 : window.innerWidth)}
      />
    );
  }

  if (allowOverflow) {
    return (
      <JMFScolllable>
        <div style={{ minWidth, height }}>
          {children}
        </div>
      </JMFScolllable>
    );
  }
  return (
    <Center style={{ width: "100%", height }}>
      {children}
    </Center>
  );
}
