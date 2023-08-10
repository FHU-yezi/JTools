import clsx from "clsx";

interface Props {
  className?: string;
  src: string;
  alt?: string;
}
export default function SSAvatar({ className, src, alt }: Props) {
  return (
    <img className={clsx(className, "rounded-full")} src={src} alt={alt} />
  );
}
