interface Props {
  url: string;
  label?: string;
  isExternal?: boolean;
}

export default function SSLink({ url, label, isExternal = false }: Props) {
  return (
    <a
      className="break-all text-blue-500 hover:text-blue-600"
      href={url}
      target={isExternal ? "_blank" : "_self"}
      rel="noreferrer"
    >
      {label ?? url}
    </a>
  );
}
