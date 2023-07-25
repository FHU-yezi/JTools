import { AiOutlineLoading } from "react-icons/ai";
import SSText from "./SSText";

interface Props {
  size?: number;
}

export default function SSLoader({ size = 36 }: Props) {
  return (
    <SSText>
      <AiOutlineLoading
        className="stroke-2 motion-safe:animate-spin"
        size={size}
      />
    </SSText>
  );
}
