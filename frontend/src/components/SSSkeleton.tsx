import clsx from "clsx";
import { JSX } from "preact/jsx-runtime";

interface Props {
  className: string;
  style?: JSX.CSSProperties;
}

export default function SSSkeleton({ className, style }: Props) {
  return (
    <div
      className={clsx(
        "rounded bg-gray-100 motion-safe:animate-pulse dark:bg-gray-800",
        className
      )}
      style={style}
    />
  );
}
