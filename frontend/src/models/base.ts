export interface Response<TData> {
  ok: boolean;
  code: number;
  message: string;
  data: TData;
}
