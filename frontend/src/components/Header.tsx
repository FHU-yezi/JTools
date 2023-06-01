import {
  ActionIcon,
  Group,
  Switch,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { AiOutlineSearch } from "react-icons/ai";
import { BsMoonStars, BsSun } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { umamiTrack } from "../utils";

interface Props {
  toolName: string;
}

export default function Header({ toolName }: Props) {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();

  return (
    <Group
      position="apart"
      style={{
        width: "100%",
        "padding-left": "5vw",
        "padding-right": "5vw",
        "background-color":
          colorScheme === "light" ? theme.colors.gray[0] : theme.colors.gray[9],
      }}
    >
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
