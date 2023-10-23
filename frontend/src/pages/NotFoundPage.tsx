import { Center, Column, Icon, PrimaryButton, Text } from "@sscreator/ui";
import { MdCancelScheduleSend } from "react-icons/md";
import { useLocation } from "wouter-preact";

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <Center className="h-screen">
      <Column className="mx-8 max-w-4xl">
        <Column gap="gap-2">
          <Icon>
            <MdCancelScheduleSend size={48} />
          </Icon>
          <Text large bold>
            啊呀，没有找到这个页面
          </Text>
        </Column>
        <Text>您要找的小工具可能不存在或已经下线。</Text>
        <PrimaryButton onClick={() => setLocation("/")} fullWidth>
          返回首页
        </PrimaryButton>
      </Column>
    </Center>
  );
}
