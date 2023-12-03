import { signal } from "@preact/signals";
import {
  Accordion,
  Center,
  Column,
  ExternalLink,
  Icon,
  Key,
  PrimaryButton,
  Row,
  SecondaryButton,
  Text,
} from "@sscreator/ui";
import { MdOutlineWarningAmber } from "react-icons/md";
import { useLocation } from "wouter-preact";

const isMoreTechInfoAccordionOpened = signal(false);

interface Props {
  error: Error;
}

export default function ErrorFallback({ error }: Props) {
  const [, setLocation] = useLocation();

  // eslint-disable-next-line no-console
  console.error(`${error.name}: ${error.message}\n${error.stack}`);

  return (
    <Center className="h-screen">
      <Column className="mx-8 max-w-4xl">
        <Column gap="gap-2">
          <Icon>
            <MdOutlineWarningAmber size={48} />
          </Icon>
          <Text large bold>
            发生意外错误
          </Text>
        </Column>
        <Text>非常抱歉给您带来不好的体验，您可尝试点击下方按钮刷新页面。</Text>
        <Text>如果您多次看到此页面，请向开发者反馈。</Text>
        <ExternalLink href="https://wenjuan.feishu.cn/m?t=sGzpuZGzUrNi-cbbb">
          前往反馈表单
        </ExternalLink>
        <Text gray>{error.toString()}</Text>

        <Row>
          <SecondaryButton
            className="flex-1"
            onClick={() => {
              setLocation("/");
              window.location.reload();
            }}
            fullWidth
          >
            返回首页
          </SecondaryButton>
          <PrimaryButton
            className="flex-1"
            onClick={() => window.location.reload()}
            fullWidth
          >
            刷新
          </PrimaryButton>
        </Row>

        <Accordion
          isOpened={isMoreTechInfoAccordionOpened}
          title="我如何提供更多技术信息？"
        >
          <Text>
            如果您使用电脑访问本服务，请按下<Key>F12</Key>
            打开开发者工具，在顶栏中选择
            Console（控制台）选项，截图其内容并在反馈时一并发送。
          </Text>
        </Accordion>
      </Column>
    </Center>
  );
}
