import clsx from "clsx";
import type { ComponentChildren } from "preact";
import SSText from "./SSText";

interface Props {
  className?: string;
  children: ComponentChildren;
  title?: string;
  subTitle?: string;
  round?: string;
  padding?: string;
  margin?: string;
  innerGap?: string;
  titleXLarge?: boolean;
}

export default function SSCard({
  className,
  children,
  title,
  subTitle,
  round = "rounded-xl",
  padding = "p-4",
  margin = "m-0",
  innerGap = "gap-3",
  titleXLarge = false,
}: Props) {
  return (
    <div
      className={clsx(
        "flex flex-col gray-border bg-white shadow dark:(border-zinc-700 bg-zinc-900)",
        className,
        round,
        padding,
        margin,
        innerGap,
      )}
    >
      {(title || subTitle) && (
        <div className="flex flex-col gap-0.5">
          {title && (
            <SSText bold large={!titleXLarge} xlarge={titleXLarge}>
              {title}
            </SSText>
          )}
          {subTitle && (
            <SSText small gray>
              {subTitle}
            </SSText>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
