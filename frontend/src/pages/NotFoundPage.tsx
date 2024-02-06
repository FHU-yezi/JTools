import { Center, Column, Heading1, SolidButton, Text } from "@sscreator/ui";
import { useLocation } from "wouter-preact";

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <Center className="mx-auto h-screen">
      <Column className="max-w-2xl w-[80vw]" gap="gap-8">
        <Heading1 className="text-center">页面走丢了</Heading1>

        <Text className="text-center">请检查您输入的链接是否正确。</Text>

        <Center>
          <SolidButton onClick={() => setLocation("/")}>返回首页</SolidButton>
        </Center>
      </Column>
    </Center>
  );
}
