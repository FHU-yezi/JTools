import clsx from "clsx";
import type { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
  className?: string;
  gray?: boolean;
  color?: string;
  bold?: boolean;
  xbold?: boolean;
  small?: boolean;
  large?: boolean;
  xlarge?: boolean;
  center?: boolean;
}

export default function SSText({
  children,
  className = "",
  gray = false,
  color = "",
  bold = false,
  xbold = false,
  small = false,
  large = false,
  xlarge = false,
  center = false,
}: Props) {
  return (
    <p
      className={clsx(className, {
        "text-zinc-900 dark:text-zinc-300": !gray && color.length === 0,
        [color]: color.length !== 0,
        "text-zinc-500 dark:text-zinc-400": gray,
        "font-semibold": bold,
        "font-bold": xbold,
        "text-sm": small,
        "text-lg": large,
        "text-xl": xlarge,
        "text-center": center,
      })}
    >
      {children}
    </p>
  );
}
