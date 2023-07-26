import clsx from "clsx";
import type { ComponentChildren } from "preact";

interface Props {
  className?: string;
  children: ComponentChildren;
}

export default function SSScolllable({ className, children }: Props) {
  return <div className={clsx(className, "overflow-x-auto")}>{children}</div>;
}
