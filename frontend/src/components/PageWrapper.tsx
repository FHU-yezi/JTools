import { Column, LoadingPage, useDocumentTitle } from "@sscreator/ui";
import type { JSX } from "preact";
import { Suspense } from "preact/compat";
import { useEffect } from "preact/hooks";
import FooterBlock from "./FooterBlock";
import HeaderBlock from "./HeaderBlock";
import ToolMetaInfo from "./ToolMetaInfo";

interface Props {
  Component(): JSX.Element;
  pageName?: string;
  disableToolMetaInfo?: boolean;
  hideDecorations?: boolean;
  isMainPage?: boolean;
}

export default function PageWrapper({
  Component,
  pageName,
  disableToolMetaInfo = false,
  hideDecorations = false,
  isMainPage = false,
}: Props) {
  // 设置页面标题
  useDocumentTitle(pageName ? `${pageName} - 简书小工具集` : "简书小工具集");

  // 处理部分情况下页面切换后不在顶部的问题
  useEffect(() => window.scrollTo(0, 0), []);

  return (
    <>
      {!hideDecorations && (
        <HeaderBlock pageName={pageName} isMainPage={isMainPage} />
      )}
      <Column className="my-4">
        <Suspense fallback={<LoadingPage />}>
          <main className="mx-auto max-w-4xl min-h-screen w-[90vw]">
            {!disableToolMetaInfo && <ToolMetaInfo />}

            <Component />
          </main>
        </Suspense>
      </Column>

      {!hideDecorations && <FooterBlock />}
    </>
  );
}
