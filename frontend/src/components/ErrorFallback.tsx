import { Accordion, Kbd, Title } from "@mantine/core";
import { BiError } from "react-icons/bi";
import { useLocation } from "wouter-preact";
import SSButton from "./SSButton";
import SSLink from "./SSLink";
import SSText from "./SSText";

interface Props {
  error: Error;
}

export default function ErrorFallback({ error }: Props) {
  const [, setLocation] = useLocation();

  // eslint-disable-next-line no-console
  console.error(`${error.name}: ${error.message}\n${error.stack}`);

  return (
    <div className="grid h-[100vh] place-content-center">
      <div className="flex w-[90vw] max-w-4xl flex-col gap-4">
        <BiError size={48} />
        <Title fz="xl" fw={700}>
          发生意外错误
        </Title>
        <SSText>
          非常抱歉给您带来不好的体验，您可尝试点击下方按钮刷新页面。
        </SSText>
        <SSText>如果您多次看到此页面，请向开发者反馈此问题。</SSText>
        <SSLink
          url="https://wenjuan.feishu.cn/m?t=sGzpuZGzUrNi-cbbb"
          label="前往反馈表单 >"
          isExternal
        />
        <SSText gray>{error.toString()}</SSText>
        <SSButton onClick={() => window.location.reload()}>刷新</SSButton>
        <SSButton
          onClick={() => {
            setLocation("/");
            window.location.reload();
          }}
        >
          返回首页
        </SSButton>
        <Accordion variant="contained">
          <Accordion.Item value="more-tech-info">
            <Accordion.Control>我如何提供更多技术信息？</Accordion.Control>
            <Accordion.Panel>
              如果您使用电脑访问本服务，请按下 <Kbd>F12</Kbd>{" "}
              打开开发者工具，在顶栏中选择
              Console（控制台）选项，截图其内容并在反馈时一并发送。
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </div>
    </div>
  );
}
