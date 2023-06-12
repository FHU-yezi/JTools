export function parseTime(timeInt: number): Date {
  // 时间加八小时，处理时区问题
  return new Date(timeInt * 1000 + 28800000);
}

export function getDatetime(dateObj: Date) {
  return dateObj.toISOString().replace("T", " ").replace(".000Z", "");
}

export function getDate(dateObj: Date) {
  return dateObj.toISOString().split("T")[0];
}

export function getTime(dateObj: Date) {
  return dateObj.toISOString().split("T")[1].replace(".000Z", "");
}
