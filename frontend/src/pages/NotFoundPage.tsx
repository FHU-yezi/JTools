import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { IoPaperPlaneSharp } from "react-icons/io5";
import { useLocation } from "wouter-preact";

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <Center>
      <Stack
        style={{
          display: "flex",
          width: "90vw",
          maxWidth: "896px",
          marginTop: "20vh",
        }}
      >
        <IoPaperPlaneSharp size={48} />
        <Title fz="xl" fw={700}>
          啊呀，没有找到这个页面
        </Title>
        <Text>您要找的小工具可能不存在或已经下线。</Text>
        <Button variant="light" onClick={() => setLocation("/")}>
          返回首页
        </Button>
      </Stack>
    </Center>
  );
}
