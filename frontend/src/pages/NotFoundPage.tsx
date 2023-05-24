import { Stack, Center, Text } from "@mantine/core";
import { Link } from "wouter-preact";
import { IoPaperPlaneSharp } from "react-icons/io5";

export default function NotFoundPage() {
  return (
    <Center h="100vh">
      <Stack align="flex-start" h={200}>
        <IoPaperPlaneSharp size={48} />
        <Text size="xl" fw={700}>
          啊呀，没有找到这个页面
        </Text>
        <Text>您要找的小工具可能不存在或已经下线。</Text>
        <Text>
          点击{" "}
          <Link href="/">
            <Text c="blue" span>
              返回首页
            </Text>
          </Link>
        </Text>
      </Stack>
      </Center>
  );
}
