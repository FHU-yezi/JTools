import { Button, Center, SimpleGrid, Text, Title } from "@mantine/core";

interface Props {
  error: any;
}

export default function ErrorFallback({ error }: Props) {
  return (
    <Center>
      <SimpleGrid spacing={4} mt="40vh">
        <Title size="md">发生意外错误</Title>
        <Text>请向开发者反馈此问题。</Text>
        <Text>技术信息：{error.toString()}</Text>
        <Button onClick={location.reload}>刷新</Button>
      </SimpleGrid>
    </Center>
  );
}
