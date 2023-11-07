export interface ResponseStruct<TData> {
  ok: boolean;
  code: number;
  msg: string;
  data: TData;
}
