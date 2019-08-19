import { FetchActionCreator } from '../defineFetch';
import { DataServiceState } from '../dataServiceReducer';

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;

export interface GetFetchOptions {
  isolatedStatus: boolean;
}

export default function getFetch<FetchResult, MergeResult>(
  fetchActionCreator: FetchActionCreator<any, FetchResult, MergeResult>,
  state: { dataService: DataServiceState },
  options?: GetFetchOptions,
): [PickResult<FetchResult, MergeResult> | null, number];
