import { JSX } from "preact/jsx-runtime";

interface Props {
  children: JSX.Element | (() => JSX.Element);
}

export default function SSScolllable({ children }: Props) {
  return <div className="overflow-x-scroll">{children}</div>;
}
