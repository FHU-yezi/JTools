export function getDatetime(dateObj: Date) {
  return dateObj.toISOString().replace("T", " ").replace(".000Z", "");
}

export function getDate(dateObj: Date) {
  return dateObj.toISOString().split("T")[0];
}

export function getTime(dateObj: Date) {
  return dateObj.toISOString().split("T")[1].replace(".000Z", "");
}