import {
  Group,
  Text,
  ActionIcon,
  Switch,
  useMantineColorScheme,
} from "@mantine/core";
import { BsMoonStars, BsSun } from "react-icons/all";
import { AiOutlineSearch } from "react-icons/ai";
import { IoIosArrowBack } from "react-icons/io";
import { umamiTrack } from "../utils";

interface Props {
  toolName: string;
}

export default function Header({ toolName }: Props) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group position="apart" style={{ width: "100%" }}>
      <Group>
        <ActionIcon
          onClick={() => (window.location.href = window.location.origin)}
        >
          <IoIosArrowBack size={22} />
        </ActionIcon>
        <Text size="lg" fw={700}>
          {toolName}
        </Text>
      </Group>
      <Group position="right">
        <ActionIcon>
          <AiOutlineSearch size={22} />
        </ActionIcon>
        <Switch
          size="md"
          color={colorScheme === "dark" ? "gray" : "dark"}
          onLabel={<BsMoonStars size={16} />}
          offLabel={<BsSun size={16} />}
          checked={colorScheme === "dark"}
          onChange={() => {
            toggleColorScheme();
            umamiTrack("toggle-color-scheme");
          }}
        />
      </Group>
    </Group>
  );
}
