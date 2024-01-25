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
import type { GetResponse } from "../models/status";
import { sendRequest } from "../utils/sendRequest";

const version = signal<string | undefined>(undefined);

export default function Footer() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    sendRequest<Record<string, never>, GetResponse>({
      method: "GET",
      endpoint: "/v1/status",
      onSuccess: ({ data }) => (version.value = data.version),
    });
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
        <Text colorScheme="gray">版本：{version.value ?? "获取中..."}</Text>
        <Text colorScheme="gray">Powered By Open-Source Software</Text>
        <Text colorScheme="gray">
          By{" "}
          <ExternalLink href="https://www.jianshu.com/u/ea36c8d8aa30">
            初心不变_叶子
          </ExternalLink>
        </Text>
      </Column>
    </FooterBlock>
  );
}
