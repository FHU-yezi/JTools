export default function umamiTrack(
  eventName?: string,
  eventData?: { [key: string]: string | number },
) {
  try {
    // eslint-disable-next-line no-undef
    umami.track(eventName, eventData);
  } catch {
    // eslint-disable-next-line no-console
    console.error(`上报事件失败：${eventName}`);
  }
}
