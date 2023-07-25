export function replaceAll(
  originalString: string,
  from: string,
  to: string
): string {
  return originalString.split(from).join(to);
}

export function removeSpace(string: string): string {
  return replaceAll(string, " ", "");
}
