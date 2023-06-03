import { Suspense } from "preact/compat";
import Header from "./Header";
import Loading from "./Loading";

interface Props {
  Component: () => JSX.Element;
  toolName: string;
}

export default function ToolWrapper({ Component, toolName }: Props) {
  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "4em",
          width: "100%",
          display: "flex",
        }}
      >
        <Header toolName={toolName} showBackArrow={true} />
      </header>
      <div style={{ height: "3em" }} />
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    </>
  );
}
