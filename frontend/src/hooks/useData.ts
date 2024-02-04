import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import type {
  SWRMutationConfiguration,
  SWRMutationResponse,
} from "swr/mutation";
import useSWRMutation from "swr/mutation";
import type { FetcherArgs } from "../utils/fetcher";

export function useData<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>(keys: FetcherArgs<TRequest>, options?: SWRConfiguration) {
  return useSWR<TResponse>(keys, options);
}

type DataTriggerReponse<TResponse> = Omit<
  SWRMutationResponse<TResponse, Error>,
  "isMutating"
> & {
  isLoading: Boolean;
};

export function useDataTrigger<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>(
  keys: FetcherArgs<TRequest>,
  options?: SWRMutationConfiguration<TResponse, Error>,
): DataTriggerReponse<TResponse> {
  const response = useSWRMutation<TResponse>(keys, options as any);

  return {
    data: response.data,
    error: response.error,
    isLoading: response.isMutating,
    trigger: response.trigger,
    reset: response.reset,
  };
}
