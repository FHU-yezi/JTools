import { Button, Title } from "@mantine/core";
import { LuConstruction } from "react-icons/lu";
import { useLocation } from "wouter-preact";
import SSText from "../components/SSText";

export default function V2UnavaliablePage() {
  const [, setLocation] = useLocation();

  return (
    <div className="grid h-[100vh] place-content-center">
      <div className="flex w-[90vw] max-w-4xl flex-col gap-4">
        <LuConstruction size={48} />
        <Title fz="xl" fw={700}>
          已下线
        </Title>
        <SSText>您正在访问的小工具已在简书小工具集 v3 中下线。</SSText>
        <SSText>如有问题，请联系开发者。</SSText>
        <Button variant="light" onClick={() => setLocation("/")}>
          返回首页
        </Button>
      </div>
    </div>
  );
}
