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
          height: "4em",
          width: "90vw",
          maxWidth: "896px",
          display: "flex",
        }}
      >
        <Header toolName={toolName} />
      </header>
      <div style={{ height: "4em" }} />
      {component()}
    </>
  );
}
