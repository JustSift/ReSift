import { GetFetchOptions } from '../getFetch';
import { FetchActionCreator } from '../defineFetch';

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;

export default function useFetch<FetchResult, MergeResult>(
  fetch: FetchActionCreator<any, FetchResult, MergeResult>,
  options?: GetFetchOptions,
): [PickResult<FetchResult, MergeResult> | null, number];
