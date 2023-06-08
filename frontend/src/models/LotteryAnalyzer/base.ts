export type TimeRange = "1d" | "7d" | "30d" | "all";

export type TimeRangeWithoutAll = Exclude<TimeRange, "all">;
