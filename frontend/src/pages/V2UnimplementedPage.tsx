import { LuServerOff } from "react-icons/lu";
import { useLocation } from "wouter-preact";
import SSButton from "../components/SSButton";
import SSCenter from "../components/SSCenter";
import SSText from "../components/SSText";

export default function V2UnimplementedPage() {
  const [, setLocation] = useLocation();

  return (
    <SSCenter className="h-[100vh]">
      <div className="flex w-[90vw] max-w-4xl flex-col gap-4">
        <LuServerOff size={48} />
        <SSText xlarge xbold>
          正在开发中
        </SSText>
        <SSText>您正在访问的小工具尚未在简书小工具集 v3 中实现。</SSText>
        <SSButton onClick={() => setLocation("/")}>返回首页</SSButton>
      </div>
    </SSCenter>
  );
}
