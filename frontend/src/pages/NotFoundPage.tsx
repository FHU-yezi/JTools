import { IoPaperPlaneSharp } from "react-icons/io5";
import { useLocation } from "wouter-preact";
import SSButton from "../components/SSButton";
import SSText from "../components/SSText";

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="grid h-[100vh] place-content-center">
      <div className="flex w-[90vw] max-w-4xl flex-col gap-4">
        <IoPaperPlaneSharp size={48} />
        <SSText xlarge xbold>
          啊呀，没有找到这个页面
        </SSText>
        <SSText>您要找的小工具可能不存在或已经下线。</SSText>
        <SSButton onClick={() => setLocation("/")}>返回首页</SSButton>
      </div>
    </div>
  );
}
