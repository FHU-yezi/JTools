import { useDocumentTitle } from "@mantine/hooks";
import Header from "../components/Header";
import SSCard from "../components/SSCard";
import SSExternalLink from "../components/SSExternalLink";
import SSText from "../components/SSText";
import {
  debugProjectRecords,
  opensourcePackages,
  v3BetaPaticipants,
} from "../thanks.json";

export default function ThanksPage() {
  // 设置页面标题
  useDocumentTitle("鸣谢 - 简书小工具集");

  return (
    <div className="flex flex-col gap-4">
      <Header toolName="鸣谢" showBackArrow />

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <SSText xlarge xbold>
            v3 Beta 内测成员
          </SSText>
          <SSText small gray>
            排名不分先后
          </SSText>
        </div>
        {Object.entries(v3BetaPaticipants).map(([name, url]) => (
          <SSText>
            {name}
            ：
            <SSExternalLink url={url} openInNewTab />
          </SSText>
        ))}

        <SSText xlarge xbold>
          开源库
        </SSText>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(opensourcePackages).map(([partName, part]) => (
            <SSCard title={partName}>
              {part.map(({ name, desc, url }) => (
                <SSText>
                  {desc}：
                  <SSExternalLink label={name} url={url} openInNewTab />
                </SSText>
              ))}
            </SSCard>
          ))}
        </div>

        <SSText xlarge xbold>
          「捉虫计划」反馈
        </SSText>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {debugProjectRecords.map((item) => (
            <SSCard
              title={`${item.time} | ${item.type}`}
              subTitle={item.module}
            >
              <SSText>{item.desc}</SSText>
              <SSText>
                反馈者：
                <SSExternalLink url={item.user_url} label={item.user_name} openInNewTab />
              </SSText>
              <SSText>{`奖励：${item.award} 简书贝`}</SSText>
            </SSCard>
          ))}
        </div>

        <div className="h-12" />
        <SSText large center>
          还有，感谢为简书生态奉献的你。
        </SSText>
      </div>
    </div>
  );
}
