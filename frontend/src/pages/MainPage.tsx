import { routes } from "../Routes";
import { Link } from "wouter-preact";

export default function MainPage() {
  return (
    <>
      {routes.map((item) => (
        <div>
          <Link href={item.path}>Go To {item.toolName}</Link>
        </div>
      ))}
    </>
  );
}
