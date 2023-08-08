import { BiError } from "react-icons/bi";
import { useLocation } from "wouter-preact";
import SSAccordion from "./SSAccordion";
import SSButton from "./SSButton";
import SSCenter from "./SSCenter";
import SSKey from "./SSKey";
import SSExternalLink from "./SSExternalLink";
import SSText from "./SSText";

interface Props {
  error: Error;
}

export default function ErrorFallback({ error }: Props) {
  const [, setLocation] = useLocation();

  // eslint-disable-next-line no-console
  console.error(`${error.name}: ${error.message}\n${error.stack}`);

  return (
    <SSCenter className="h-screen">
      <div className="max-w-4xl w-[90vw] flex flex-col gap-4">
        <SSText>
          <BiError size={48} />
        </SSText>
        <SSText xlarge xbold>
          发生意外错误
        </SSText>
        <SSText>
          非常抱歉给您带来不好的体验，您可尝试点击下方按钮刷新页面。
        </SSText>
        <SSText>如果您多次看到此页面，请向开发者反馈此问题。</SSText>
        <SSExternalLink
          url="https://wenjuan.feishu.cn/m?t=sGzpuZGzUrNi-cbbb"
          label="前往反馈表单 >"
          openInNewTab
        />
        <SSText gray>{error.toString()}</SSText>

        <SSButton onClick={() => window.location.reload()}>刷新</SSButton>
        <SSButton
          onClick={() => {
            setLocation("/");
            window.location.reload();
          }}
        >
          返回首页
        </SSButton>

        <SSAccordion title="我如何提供更多技术信息？">
          <SSText>
            如果您使用电脑访问本服务，请按下<SSKey>F12</SSKey>
            打开开发者工具，在顶栏中选择
            Console（控制台）选项，截图其内容并在反馈时一并发送。
          </SSText>
        </SSAccordion>
      </div>
    </SSCenter>
  );
}
