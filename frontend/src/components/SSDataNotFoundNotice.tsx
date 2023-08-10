import { BsDatabaseDash } from "react-icons/bs";
import SSText from "./SSText";

interface Props {
  message?: string;
}

export default function SSDataNotFoundNotice({ message = "无数据" }: Props) {
  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <SSText>
        <BsDatabaseDash size={48} />
      </SSText>
      <SSText large>{message}</SSText>
    </div>
  );
}
