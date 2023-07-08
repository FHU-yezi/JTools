import type { ComponentChildren } from "preact";

interface Props {
  children: ComponentChildren;
}

export default function SSScolllable({ children }: Props) {
  return <div className="overflow-x-scroll">{children}</div>;
}
