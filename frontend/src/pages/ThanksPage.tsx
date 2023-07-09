import { useDocumentTitle } from "@mantine/hooks";
import {
  debugProjectRecords,
  opensourcePackages,
  v3BetaPaticipants,
} from "../../public/thanks.json";
import Header from "../components/Header";
import SSLink from "../components/SSLink";
import SSText from "../components/SSText";

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
            <SSLink url={url} isExternal />
          </SSText>
        ))}

        <SSText xlarge xbold>
          开源库
        </SSText>
        <div className="columns-1 gap-4 space-y-4 sm:columns-2">
          {Object.entries(opensourcePackages).map(([partName, part]) => (
            <div className="flex flex-col gap-4 rounded-2xl border bg-white p-4 shadow dark:bg-gray-900">
              <SSText bold large>
                {partName}
              </SSText>
              {part.map(({ name, desc, url }) => (
                <SSText>
                  {desc}：
                  <SSLink label={name} url={url} isExternal />
                </SSText>
              ))}
            </div>
          ))}
        </div>

        <SSText xlarge xbold>
          「捉虫计划」反馈
        </SSText>
        <div className="row-auto grid grid-cols-1 gap-4 sm:grid-cols-2">
          {debugProjectRecords.map((item) => (
            <div className="rounded-2xl border p-4 shadow">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-0.5">
                  <SSText bold large>{`${item.time} | ${item.type}`}</SSText>
                  <SSText small gray>
                    {item.module}
                  </SSText>
                </div>
                <SSText>{item.desc}</SSText>
                <SSText>
                  反馈者：
                  <SSLink
                    url={item.user_url}
                    label={item.user_name}
                    isExternal
                  />
                </SSText>
                <SSText>{`奖励：${item.award} 简书贝`}</SSText>
              </div>
            </div>
          ))}
        </div>

        <div className="h-9" />
        <SSText large center>
          还有，感谢为简书生态奉献的你。
        </SSText>
      </div>
    </div>
  );
}
