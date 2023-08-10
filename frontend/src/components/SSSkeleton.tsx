import clsx from "clsx";
import type { JSX } from "preact/jsx-runtime";

interface Props {
  className: string;
  style?: JSX.CSSProperties;
}

export default function SSSkeleton({ className, style }: Props) {
  return (
    <div
      className={clsx(
        "rounded bg-zinc-100 motion-safe:animate-pulse dark:bg-zinc-800",
        className,
      )}
      style={style}
    />
  );
}
