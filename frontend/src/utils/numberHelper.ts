export function roundFloat(number: number, ndigits: number) {
  return Math.round(number * 10 ** ndigits) / 10 ** ndigits;
}
