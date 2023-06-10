import { Center } from "@mantine/core";
import { JSX } from "preact/jsx-runtime";

interface Props {
    children: JSX.Element | (() => JSX.Element)
    minWidth?: number
    height?: number;
    allowOverflow?: boolean
}

export default function ChartWrapper({
  children, minWidth = undefined, height = undefined, allowOverflow = false,
}: Props) {
  if (allowOverflow) {
    return (
      <div style={{ overflowX: "scroll" }}>
        <div style={{ minWidth, height }}>
          {children}
        </div>
      </div>
    );
  }
  return (
    <Center style={{ width: "100%", height }}>
      {children}
    </Center>
  );
}
