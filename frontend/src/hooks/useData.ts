import type { SWRConfiguration } from "swr";
import useSWR from "swr";
import type {
  SWRInfiniteConfiguration,
  SWRInfiniteResponse,
} from "swr/infinite";
import useSWRInfinite from "swr/infinite";
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
  isLoading: boolean;
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

type GetKeyFunction<TRequest, TResponse> = ({
  currentPage,
  previousPageData,
}: {
  currentPage: number;
  previousPageData: TResponse | null;
}) => FetcherArgs<TRequest> | null;

type DataInfiniteResponse<TResponse> = Omit<
  SWRInfiniteResponse<TResponse, Error>,
  "size" | "setSize"
> & {
  nextPage: () => void;
};

export function useDataInfinite<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>(
  getKey: GetKeyFunction<TRequest, TResponse>,
  options?: SWRInfiniteConfiguration,
): DataInfiniteResponse<TResponse> {
  const response = useSWRInfinite<TResponse>(
    (pageIndex, previousPageData) =>
      getKey({ currentPage: pageIndex, previousPageData }),
    options,
  );

  return {
    data: response.data,
    error: response.error,
    isLoading: response.isLoading,
    isValidating: response.isValidating,
    mutate: response.mutate,
    nextPage: () => response.setSize((currentSize: number) => currentSize + 1),
  };
}

type DataTriggerInfiniteResponse<TResponse> = Omit<
  SWRInfiniteResponse<TResponse, Error>,
  "size" | "setSize"
> & {
  nextPage: () => void;
  trigger: () => void;
  reset: () => void;
};

export function useDataTriggerInfinite<
  TRequest extends Record<string, any>,
  TResponse extends Record<string, any>,
>(
  getKey: GetKeyFunction<TRequest, TResponse>,
  options?: SWRInfiniteConfiguration,
): DataTriggerInfiniteResponse<TResponse> {
  const response = useSWRInfinite<TResponse>(
    (pageIndex, previousPageData) =>
      getKey({ currentPage: pageIndex, previousPageData }),
    { ...options, initialSize: 0 },
  );

  return {
    data: response.data,
    error: response.error,
    isLoading: response.isLoading,
    isValidating: response.isValidating,
    mutate: response.mutate,
    nextPage: () => response.setSize((currentSize: number) => currentSize + 1),
    trigger: () => response.setSize(1),
    reset: () => response.setSize(0),
  };
}
