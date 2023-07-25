import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(timezone);
dayjs.extend(updateLocale);
dayjs.locale("zh-cn");

dayjs.tz.setDefault("Asia/Shanghai");
dayjs.updateLocale("zh-cn", {
  relativeTime: {
    future: "%s后",
    past: "%s前",
    s: "刚刚",
    m: "一分钟",
    mm: "%d 分钟",
    h: "一小时",
    hh: "%d 小时",
    d: "一天",
    dd: "%d 天",
    M: "一个月",
    MM: "%d 个月",
    y: "一年",
    yy: "%d 年",
  },
});

export function parseTime(timeInt: number): Dayjs {
  // 时间加八小时，处理时区问题
  return dayjs.unix(timeInt);
}

export function getDatetime(dateObj: Dayjs) {
  return dateObj.format("YYYY-MM-DD HH:mm:ss");
}

export function getDateTimeWithoutSecond(dateObj: Dayjs) {
  return dateObj.format("YYYY-MM-DD HH:mm");
}

export function getDate(dateObj: Dayjs) {
  return dateObj.format("YYYY-MM-DD");
}

export function getTime(dateObj: Dayjs) {
  return dateObj.format("HH:mm:ss");
}

export function getHumanReadableTimeDelta(dateObj: Dayjs) {
  return dateObj.fromNow();
}
