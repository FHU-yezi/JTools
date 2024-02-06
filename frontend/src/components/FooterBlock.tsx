import { ExternalLink, Footer, InternalLink, Text } from "@sscreator/ui";
import { useLocation } from "wouter-preact";
import { useData } from "../hooks/useData";
import type { GetResponse } from "../models/status";

export default function FooterBlock() {
  const [, setLocation] = useLocation();
  const { data: toolStatus } = useData<Record<string, never>, GetResponse>({
    method: "GET",
    endpoint: "/v1/status",
  });

  return (
    <Footer className="mx-auto max-w-4xl w-[90vw]">
      <ExternalLink href="https://status.sscreator.com/status/jtools">
        服务状态
      </ExternalLink>
      <InternalLink onClick={() => setLocation("/thanks")} path="/thanks">
        鸣谢
      </InternalLink>
      <ExternalLink href="https://wenjuan.feishu.cn/m?t=sjQp3W8yUrNi-g37f">
        意见反馈
      </ExternalLink>
      <Text colorScheme="gray">版本：{toolStatus?.version ?? "获取中..."}</Text>
      <Text colorScheme="gray">Powered By Open-Source Software</Text>
      <Text colorScheme="gray">
        By{" "}
        <ExternalLink href="https://www.jianshu.com/u/ea36c8d8aa30">
          初心不变_叶子
        </ExternalLink>
      </Text>
    </Footer>
  );
}
