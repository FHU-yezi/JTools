import { batch, signal } from "@preact/signals";
import type { Dayjs } from "dayjs";
import toast from "react-hot-toast";
import SSAvatar from "../components/SSAvatar";
import SSBadge from "../components/SSBadge";
import SSButton from "../components/SSButton";
import SSLink from "../components/SSLink";
import SSText from "../components/SSText";
import SSTextInput from "../components/SSTextInput";
import {
  VIPInfoRequest,
  VIPInfoResponse,
} from "../models/VIPInfoViewer/VIPInfo";
import { commonAPIErrorHandler } from "../utils/errorHandler";
import { fetchData } from "../utils/fetchData";
import {
  getDate,
  getHumanReadableTimeDelta,
  parseTime,
} from "../utils/timeHelper";
import VIPBadgeBronzeURL from "/vip_badges/vip_badge_bronze.png";
import VIPBadgeGoldURL from "/vip_badges/vip_badge_gold.png";
import VIPBadgePlatinaURL from "/vip_badges/vip_badge_platina.png";
import VIPBadgeSilverURL from "/vip_badges/vip_badge_silver.png";

const userURL = signal("");
const userName = signal<string | undefined>(undefined);
const isLoading = signal(false);
const VIPType = signal<string | undefined>(undefined);
const VIPExpireTime = signal<Dayjs | undefined>(undefined);

const VIPTypeToBadgeImageURL: Record<string, string> = {
  铜牌: VIPBadgeBronzeURL,
  银牌: VIPBadgeSilverURL,
  金牌: VIPBadgeGoldURL,
  白金: VIPBadgePlatinaURL,
};

function handleQuery() {
  if (isLoading.value) {
    return;
  }

  if (userURL.value.length === 0) {
    toast("请输入用户个人主页链接", {
      icon: " ⚠️",
    });
    return;
  }

  fetchData<VIPInfoRequest, VIPInfoResponse>(
    "POST",
    "/tools/VIP_info_viewer/VIP_info",
    {
      user_url: userURL.value,
    },
    (data) =>
      batch(() => {
        userName.value = data.name;
        VIPType.value = data.VIP_type;
        if (data.VIP_expire_time !== undefined) {
          VIPExpireTime.value = parseTime(data.VIP_expire_time);
        }
      }),
    commonAPIErrorHandler,
    isLoading
  );
}

export default function VIPInfoViewer() {
  return (
    <div className="flex flex-col gap-4">
      <SSTextInput
        label="用户个人主页链接"
        value={userURL}
        onEnter={handleQuery}
      />
      <SSButton onClick={handleQuery} loading={isLoading.value}>
        查询
      </SSButton>

      {userName.value !== undefined && (
        <SSText>
          昵称：
          <SSLink url={userURL.value} label={userName.value} isExternal />
        </SSText>
      )}

      {VIPType.value !== undefined && (
        <>
          <div className="flex max-w-fit items-center gap-1">
            <SSText>会员级别：</SSText>
            <SSAvatar
              className="mr-1.5 h-6 w-6"
              src={VIPTypeToBadgeImageURL[VIPType.value]}
              alt={`${VIPType.value} 徽章图标`}
            />
            <SSBadge className="bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {VIPType.value}
            </SSBadge>
          </div>
          {VIPType.value !== "无会员" && (
            <SSText>
              到期时间：
              {getDate(VIPExpireTime.value!)}（
              {getHumanReadableTimeDelta(VIPExpireTime.value!)}）
            </SSText>
          )}
        </>
      )}
    </div>
  );
}
