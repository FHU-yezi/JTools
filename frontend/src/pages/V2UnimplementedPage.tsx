import { Button, Title } from "@mantine/core";
import { LuServerOff } from "react-icons/lu";
import { useLocation } from "wouter-preact";
import SSText from "../components/SSText";

export default function V2UnimplementedPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="grid h-[100vh] place-content-center">
      <div className="flex w-[90vw] max-w-4xl flex-col gap-4">
        <LuServerOff size={48} />
        <Title fz="xl" fw={700}>
          正在开发中
        </Title>
        <SSText>您正在访问的小工具尚未在简书小工具集 v3 中实现。</SSText>
        <Button variant="light" onClick={() => setLocation("/")}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
