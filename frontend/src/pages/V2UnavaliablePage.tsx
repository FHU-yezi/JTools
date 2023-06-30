import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { LuConstruction } from "react-icons/lu";
import { useLocation } from "wouter-preact";

export default function V2UnavaliablePage() {
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
        <LuConstruction size={48} />
        <Title fz="xl" fw={700}>
          已下线
        </Title>
        <Text>您正在访问的小工具已在简书小工具集 v3 中下线。</Text>
        <Text>如有问题，请联系开发者。</Text>
        <Button variant="light" onClick={() => setLocation("/")}>
          返回首页
        </Button>
      </Stack>
    </Center>
  );
}
