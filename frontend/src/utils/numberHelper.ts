export function RoundFloat(number: number, ndigits: number) {
  return Math.round(number * 10 ** ndigits) / 10 ** ndigits;
}
