import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import type { FetcherArgs } from "../utils/fetcher";

export function useData<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>(keys: FetcherArgs<TRequest>, options?: SWRConfiguration) {
  return useSWR<TResponse>(keys, options);
}
