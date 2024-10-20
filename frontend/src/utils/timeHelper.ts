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

export class Datetime {
  dayjsObject: Dayjs;

  constructor(timeString?: string) {
    if (timeString !== undefined) {
      this.dayjsObject = dayjs(timeString);
    } else {
      this.dayjsObject = dayjs();
    }
  }

  get date(): string {
    return this.dayjsObject.format("YYYY-MM-DD");
  }

  get time(): string {
    return this.dayjsObject.format("HH:mm:ss");
  }

  get datetime(): string {
    return this.dayjsObject.format("YYYY-MM-DD HH:mm:ss");
  }

  get datetimeWithoutSecond(): string {
    return this.dayjsObject.format("YYYY-MM-DD HH:mm");
  }

  get humanReadableTimedelta(): string {
    return this.dayjsObject.fromNow();
  }
}
