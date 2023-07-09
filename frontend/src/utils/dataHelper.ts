export function buildSegmentedControlDataFromRecord<TValue>(
  record: Record<string, TValue>
): { label: string; value: TValue }[] {
  return Object.entries(record).map(([key, value]) => ({ label: key, value }));
}
