import Header from "./Header";

interface Props {
  component: any;
  toolName: string;
}

export default function ToolWrapper({ component, toolName }: Props) {
  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "4em",
          width: "100%",
          display: "flex",
        }}
      >
        <Header toolName={toolName} />
      </header>
      <div style={{ height: "3em" }} />
      {component()}
    </>
  );
}
