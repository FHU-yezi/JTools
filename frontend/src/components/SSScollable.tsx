import { JSX } from "preact/jsx-runtime";

interface Props {
  children: JSX.Element | (() => JSX.Element);
}

export default function SSScolllable({ children }: Props) {
  return <div style={{ overflowX: "scroll" }}>{children}</div>;
}
