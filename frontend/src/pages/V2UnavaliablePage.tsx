import { LuConstruction } from "react-icons/lu";
import { useLocation } from "wouter-preact";
import SSButton from "../components/SSButton";
import SSCenter from "../components/SSCenter";
import SSText from "../components/SSText";

export default function V2UnavaliablePage() {
  const [, setLocation] = useLocation();

  return (
    <SSCenter className="h-[100vh]">
      <div className="max-w-4xl w-[90vw] flex flex-col gap-4">
        <LuConstruction size={48} />
        <SSText xlarge xbold>
          已下线
        </SSText>
        <SSText>您正在访问的小工具已在简书小工具集 v3 中下线。</SSText>
        <SSText>如有问题，请联系开发者。</SSText>
        <SSButton onClick={() => setLocation("/")}>返回首页</SSButton>
      </div>
    </SSCenter>
  );
}
