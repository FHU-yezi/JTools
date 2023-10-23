import { signal } from "@preact/signals";
import {
  Column,
  ExternalLink,
  Footer as FooterBlock,
  InternalLink,
  Text,
} from "@sscreator/ui";
import { useEffect } from "preact/hooks";
import { useLocation } from "wouter-preact";
import type { StatusResponse } from "../models/status";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

const version = signal<string | undefined>(undefined);

export default function Footer() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    fetchData<Record<string, never>, StatusResponse>(
      "GET",
      "/status",
      {},
      (data) => (version.value = data.version),
      commonAPIErrorHandler,
    );
  }, []);

  return (
    <FooterBlock>
      <Column gap="gap-2">
        <ExternalLink href="https://status.sscreator.com/status/jtools">
          服务状态
        </ExternalLink>
        <InternalLink onClick={() => setLocation("/thanks")} path="/thanks">
          鸣谢
        </InternalLink>
        <ExternalLink href="https://wenjuan.feishu.cn/m?t=sjQp3W8yUrNi-g37f">
          意见反馈
        </ExternalLink>
        <Text gray>版本：{version.value ?? "获取中..."}</Text>
        <Text gray>Powered By Open-Source Software</Text>
        <Text gray>
          By{" "}
          <ExternalLink href="https://www.jianshu.com/u/ea36c8d8aa30">
            初心不变_叶子
          </ExternalLink>
        </Text>
      </Column>
    </FooterBlock>
  );
}
