import { IoPaperPlaneSharp } from "react-icons/io5";
import { useLocation } from "wouter-preact";
import SSButton from "../components/SSButton";
import SSCenter from "../components/SSCenter";
import SSText from "../components/SSText";

export default function NotFoundPage() {
  const [, setLocation] = useLocation();

  return (
    <SSCenter className="h-screen">
      <div className="max-w-4xl w-[90vw] flex flex-col gap-4">
        <IoPaperPlaneSharp size={48} />
        <SSText xlarge xbold>
          啊呀，没有找到这个页面
        </SSText>
        <SSText>您要找的小工具可能不存在或已经下线。</SSText>
        <SSButton onClick={() => setLocation("/")}>返回首页</SSButton>
      </div>
    </SSCenter>
  );
}
