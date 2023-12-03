import { Center, Column, Icon, PrimaryButton, Text } from "@sscreator/ui";
import { MdAppsOutage } from "react-icons/md";
import { useLocation } from "wouter-preact";

export default function V2UnimplementedPage() {
  const [, setLocation] = useLocation();

  return (
    <Center className="h-screen">
      <Column className="mx-8 max-w-4xl">
        <Column gap="gap-2">
          <Icon>
            <MdAppsOutage size={48} />
          </Icon>
          <Text large bold>
            正在开发中
          </Text>
        </Column>
        <Text>您正在访问的小工具尚未在简书小工具集 v3 中实现。</Text>
        <Text>如有疑问，请联系开发者。</Text>
        <PrimaryButton onClick={() => setLocation("/")} fullWidth>
          返回首页
        </PrimaryButton>
      </Column>
    </Center>
  );
}
