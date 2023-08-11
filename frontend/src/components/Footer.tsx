import { signal } from "@preact/signals";
import { useEffect } from "preact/hooks";
import type { StatusResponse } from "../models/status";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import SSExternalLink from "./SSExternalLink";
import SSInternalLink from "./SSInternalLink";
import SSText from "./SSText";

const version = signal<string | undefined>(undefined);

export default function Footer() {
  useEffect(() => {
    fetchData<Record<string, never>, StatusResponse>(
      "GET",
      "/status",
      {},
      (data) => (version.value = data.version),
      commonAPIErrorHandler,
    );
  }, []);

  return (
    <div className="color-layer-2 mx-auto py-6">
      <div className="mx-auto max-w-4xl w-[90vw] flex flex-col gap-2">
        <SSExternalLink
          label="服务状态"
          url="https://status.sscreator.com/status/jtools"
        />
        <SSInternalLink label="鸣谢" url="/thanks" />
        <SSExternalLink
          label="意见反馈"
          url="https://wenjuan.feishu.cn/m?t=sjQp3W8yUrNi-g37f"
        />

        <SSText gray>版本：{version.value ?? "获取中..."}</SSText>
        <SSText gray>Powered By Open-Source Software</SSText>
        <SSText gray>
          By{" "}
          <SSExternalLink
            label="初心不变_叶子"
            url="https://www.jianshu.com/u/ea36c8d8aa30"
          />
        </SSText>
      </div>
    </div>
  );
}
