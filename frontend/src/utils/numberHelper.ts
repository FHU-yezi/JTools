export function RoundFloat(number: number, ndigits: number) {
  return Math.round(number * Math.pow(10, ndigits)) / Math.pow(10, ndigits);
}
