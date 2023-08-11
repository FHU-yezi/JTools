export function whenEnterOrSpace(event: KeyboardEvent, callback: () => void) {
  if (event.key === "Enter" || event.key === "Space") {
    callback();
  }
}
