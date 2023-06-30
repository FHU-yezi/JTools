import { Button, Center, Stack, Text, Title } from "@mantine/core";
import { LuServerOff } from "react-icons/lu";
import { useLocation } from "wouter-preact";

export default function V2UnimplementedPage() {
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
        <LuServerOff size={48} />
        <Title fz="xl" fw={700}>
          正在开发中
        </Title>
        <Text>您正在访问的小工具尚未在简书小工具集 v3 中实现。</Text>
        <Button variant="light" onClick={() => setLocation("/")}>
          返回首页
        </Button>
      </Stack>
    </Center>
  );
}
