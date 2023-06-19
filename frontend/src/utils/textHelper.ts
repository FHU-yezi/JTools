export function replaceAll(originalString: string, from: string, to: string): string {
  return originalString.split(from).join(to);
}
