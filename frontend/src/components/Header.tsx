import {
  ActionIcon,
  Group,
  Switch,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from "@mantine/core";
import { spotlight } from "@mantine/spotlight";
import { AiOutlineSearch } from "react-icons/ai";
import { BsMoonStars, BsSun } from "react-icons/bs";
import { IoIosArrowBack } from "react-icons/io";
import { useLocation } from "wouter-preact";
import umamiTrack from "../utils/umamiTrack";

interface Props {
  toolName: string;
  showBackArrow: boolean;
}

export default function Header({ toolName, showBackArrow }: Props) {
  const theme = useMantineTheme();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [, setLocation] = useLocation();

  return (
    <Group
      position="apart"
      style={{
        width: "100%",
        paddingLeft: "5vw",
        paddingRight: "5vw",
        backgroundColor:
          colorScheme === "light" ? theme.colors.gray[0] : theme.colors.gray[9],
      }}
      noWrap
    >
      <Group noWrap>
        {showBackArrow && (
          <ActionIcon onClick={() => setLocation("/")}>
            <IoIosArrowBack size={22} />
          </ActionIcon>
        )}
        <Text
          size="lg"
          fw={700}
          style={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "calc(90vw - 150px)",
          }}
        >
          {toolName}
        </Text>
      </Group>
      <Group position="right" noWrap>
        <ActionIcon onClick={spotlight.open}>
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
