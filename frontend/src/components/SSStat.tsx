import SSText from "./SSText";

interface Props {
  title: string;
  value: string | number;
  desc?: string;
}

export default function SSStat({ title, value, desc = "" }: Props) {
  return (
    <div className="flex flex-col gap-1">
      <SSText bold>{title}</SSText>
      <SSText xlarge>{value}</SSText>
      <SSText small gray>
        {desc}
      </SSText>
    </div>
  );
}
