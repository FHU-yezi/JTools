import WordCloud from "react-d3-cloud";
import SSScolllable from "../SSScollable";

interface Props {
  data: { text: string; value: number }[];
}

export default function SSWordcloud({ data }: Props) {
  return (
    <SSScolllable>
      <div
        className="select-none"
        style={{
          width: 1080,
          height: 720,
        }}
      >
        <WordCloud
          width={1080}
          height={720}
          rotate={() => 0}
          fontSize={(word) => word.value * 15}
          // 在 [128,256] 区间内生成随机透明度
          fill={() => "#EA6F5A"}
          data={data}
        />
      </div>
    </SSScolllable>
  );
}
