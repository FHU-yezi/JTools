import type { ComponentChildren } from "preact";
import SSText from "./SSText";

interface Props {
  children: ComponentChildren;
}

export default function SSKey({ children }: Props) {
  return (
    <SSText
      className="color-layer-2 gray-border mx-1 inline-block rounded px-1 shadow"
      bold
    >
      {" "}
      {children}{" "}
    </SSText>
  );
}
