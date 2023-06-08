export default function umamiTrack(
  event_name?: string,
  event_data?: { [key: string]: string | number },
) {
  // @ts-ignore
  umami.track(event_name, event_data);
}