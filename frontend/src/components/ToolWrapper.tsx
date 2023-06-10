import { JSX, Suspense, useEffect } from "preact/compat";
import Header from "./Header";
import Loading from "./Loading";

interface Props {
  Component: () => JSX.Element;
  toolName: string;
}

export default function ToolWrapper({ Component, toolName }: Props) {
  // 处理部分情况下页面切换后不在顶部的问题
  useEffect(() => window.scrollTo(0, 0));

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
          zIndex: 3,
        }}
      >
        <Header toolName={toolName} showBackArrow />
      </header>
      <div style={{ height: "3em" }} />
      <Suspense fallback={<Loading />}>
        <Component />
      </Suspense>
    </>
  );
}
