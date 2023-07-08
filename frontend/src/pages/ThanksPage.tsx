import { useDocumentTitle } from "@mantine/hooks";
import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import Header from "../components/Header";
import SSLink from "../components/SSLink";
import SSText from "../components/SSText";
import { DebugProjectRecordsItem, ThanksResponse } from "../models/thanks";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";

const opensourcePackages = signal<Record<string, string> | undefined>(
  undefined
);
const v3BetaPaticipants = signal<Record<string, string> | undefined>(undefined);
const debugProjectRecords = signal<DebugProjectRecordsItem[] | undefined>(
  undefined
);

export default function ThanksPage() {
  // 设置页面标题
  useDocumentTitle("鸣谢 - 简书小工具集");

  useEffect(() => {
    try {
      fetchData<Record<string, never>, ThanksResponse>(
        "GET",
        "/thanks",
        {},
        (data) => {
          opensourcePackages.value = data.opensource_packages;
          v3BetaPaticipants.value = data.v3_beta_paticipants;
          debugProjectRecords.value = data.debug_project_records;
        },
        commonAPIErrorHandler
      );
    } catch {}
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <Header toolName="鸣谢" showBackArrow />

      <div className="flex flex-col gap-4">
        {typeof v3BetaPaticipants.value !== "undefined" && (
          <>
            <div className="flex flex-col gap-0.5">
              <SSText xlarge xbold>
                v3 Beta 内测成员
              </SSText>
              <SSText small gray>
                排名不分先后
              </SSText>
            </div>
            {Object.entries(v3BetaPaticipants.value).map(([name, url]) => (
              <SSText>
                {name}
                ：
                <SSLink url={url} isExternal />
              </SSText>
            ))}
          </>
        )}

        {typeof opensourcePackages.value !== "undefined" && (
          <>
            <SSText xlarge xbold>
              开源库
            </SSText>
            {Object.entries(opensourcePackages.value).map(([name, url]) => (
              <SSText>
                {name}
                ：
                <SSLink
                  url={url}
                  label={`${url.split("/")[4]} - GitHub`}
                  isExternal
                />
              </SSText>
            ))}
          </>
        )}

        {typeof debugProjectRecords.value !== "undefined" && (
          <>
            <SSText xlarge xbold>
              「捉虫计划」反馈
            </SSText>
            {debugProjectRecords.value.map((item) => (
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
          </>
        )}

        {typeof v3BetaPaticipants.value !== "undefined" &&
          typeof opensourcePackages.value !== "undefined" &&
          typeof debugProjectRecords.value !== "undefined" && (
            <>
              <div className="h-9" />
              <SSText large center>
                还有，感谢为简书生态奉献的你。
              </SSText>
            </>
          )}
      </div>
    </div>
  );
}
