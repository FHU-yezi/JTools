import clsx from "clsx";
import SSText from "./SSText";

interface Props {
  className: string;
  title: string;
  value: string | number;
  desc?: string;
}

export default function SSStat({ className, title, value, desc = "" }: Props) {
  return (
    <div className={clsx(className, "flex flex-col gap-1")}>
      <SSText bold>{title}</SSText>
      <SSText xlarge>{value}</SSText>
      <SSText small gray>
        {desc}
      </SSText>
    </div>
  );
}
