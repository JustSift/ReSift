import { FetchActionCreator } from '../defineFetch';

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;

declare function useData<FetchArgs extends any[] = any, FetchResult = any, MergeResult = any>(
  fetch: FetchActionCreator<FetchArgs, FetchResult, MergeResult>,
): PickResult<FetchResult, MergeResult> | null;

export default useData;
