import clsx from "clsx";
import type { ComponentChildren } from "preact";

interface Props {
  className?: string;
  children: ComponentChildren;
}

export default function SSCenter({ className, children }: Props) {
  return (
    <div className={clsx(className, "grid place-content-center")}>
      {children}
    </div>
  );
}
