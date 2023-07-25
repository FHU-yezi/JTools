import clsx from "clsx";

interface Props {
  children: string;
  className?: string;
  large?: boolean;
}

export default function SSBadge({ children, className, large }: Props) {
  return (
    <p
      className={clsx(className, "max-w-fit rounded-md p-1 px-2", {
        "text-sm": !large,
      })}
    >
      {children}
    </p>
  );
}
