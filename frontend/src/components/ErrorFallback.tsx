import {
  Accordion,
  Button,
  Center,
  Kbd,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { BiError } from "react-icons/bi";

interface Props {
  error: any;
}

export default function ErrorFallback({ error }: Props) {
  return (
    <Center>
      <Stack
        style={{
          display: "flex",
          width: "90vw",
          "max-width": "896px",
          "margin-top": "20vh",
        }}
      >
        <BiError size={48} />
        <Title fz="xl" fw={700}>
          发生意外错误
        </Title>
        <Text>非常抱歉给您带来不好的体验，您可尝试点击下方按钮刷新页面。</Text>
        <Text>如果您多次看到此页面，请向开发者反馈此问题。</Text>
        <Text fz="sm" c="dimmed">
          {error.toString()}
        </Text>
        <Button onClick={() => window.location.reload()}>刷新</Button>
        <Accordion variant="contained">
          <Accordion.Item value="more-tech-info">
            <Accordion.Control>我如何提供更多技术信息？</Accordion.Control>
            <Accordion.Panel>
              如果您使用电脑访问本服务，请按下 <Kbd>F12</Kbd>
              打开开发者工具，在顶栏中选择
              Console（控制台）选项，截图其内容并在反馈时一并发送。
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </Stack>
    </Center>
  );
}
