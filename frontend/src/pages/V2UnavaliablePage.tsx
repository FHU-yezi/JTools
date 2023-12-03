import { Center, Column, Icon, PrimaryButton, Text } from "@sscreator/ui";
import { MdSettingsApplications } from "react-icons/md";
import { useLocation } from "wouter-preact";

export default function V2UnavaliablePage() {
  const [, setLocation] = useLocation();

  return (
    <Center className="h-screen">
      <Column className="mx-8 max-w-4xl">
        <Column gap="gap-2">
          <Icon>
            <MdSettingsApplications size={48} />
          </Icon>
          <Text large bold>
            已下线
          </Text>
        </Column>
        <Text>您正在访问的小工具已在简书小工具集 v3 中下线。</Text>
        <Text>如有疑问，请联系开发者。</Text>
        <PrimaryButton onClick={() => setLocation("/")} fullWidth>
          返回首页
        </PrimaryButton>
      </Column>
    </Center>
  );
}
