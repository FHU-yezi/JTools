declare const umami: any;

export default function umamiTrack(
  eventName?: string,
  eventData?: { [key: string]: string | number },
) {
  try {
    umami.track(eventName, eventData);
  } catch {
    // eslint-disable-next-line no-console
    console.error(`上报事件失败：${eventName}`);
  }
}
