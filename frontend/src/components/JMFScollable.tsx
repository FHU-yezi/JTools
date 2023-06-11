import { JSX } from "preact/jsx-runtime";

interface Props {
    children: JSX.Element | (() => JSX.Element)
}

export default function JMFScolllable({ children }: Props) {
  return (
    <div style={{ overflowX: "scroll" }}>
      {children}
    </div>
  );
}
