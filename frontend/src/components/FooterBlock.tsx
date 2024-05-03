import { ExternalLink, Footer, InternalLink, Text } from "@sscreator/ui";
import { useLocation } from "wouter-preact";
import { useStatus } from "../api/status";

export default function FooterBlock() {
  const [, setLocation] = useLocation();
  const { data: toolStatus } = useStatus();

  return (
    <Footer className="mx-auto max-w-4xl w-[90vw] mt-8">
      <ExternalLink href="https://status.sscreator.com">服务状态</ExternalLink>
      <InternalLink onClick={() => setLocation("/thanks")} path="/thanks">
        鸣谢
      </InternalLink>
      <ExternalLink href="https://wenjuan.feishu.cn/m?t=sjQp3W8yUrNi-g37f">
        意见反馈
      </ExternalLink>
      <Text color="gray">版本：{toolStatus?.version ?? "获取中..."}</Text>
      <Text color="gray">Powered By Open-Source Software</Text>
      <Text color="gray">
        By{" "}
        <ExternalLink href="https://www.jianshu.com/u/ea36c8d8aa30">
          初心不变_叶子
        </ExternalLink>
      </Text>
    </Footer>
  );
}
