export default function umamiTrack(
  eventName?: string,
  eventData?: { [key: string]: string | number },
) {
  // eslint-disable-next-line no-undef
  umami.track(eventName, eventData);
}
