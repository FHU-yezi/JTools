import clsx from "clsx";
import type { ComponentChildren } from "preact";
import SSScolllable from "./SSScollable";
import SSText from "./SSText";

interface Props {
  className?: string;
  data: Record<string, ComponentChildren>[];
  tableItemKey?: string;
}

export default function SSTable({ className, data, tableItemKey }: Props) {
  return (
    <SSScolllable>
      <table className={clsx(className, "gray-border w-full rounded")}>
        <thead className="color-layer-2">
          <tr>
            {Object.keys(data[0]).map((item) => (
              <th className="gray-border py-2">
                <SSText bold center>
                  {item}
                </SSText>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((line) => (
            <tr key={tableItemKey && line[tableItemKey]}>
              {Object.values(line).map((item) => (
                <td className="gray-border color-layer-1 place-content-center py-1.5">
                  <SSText className="grid place-content-center">{item}</SSText>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </SSScolllable>
  );
}
