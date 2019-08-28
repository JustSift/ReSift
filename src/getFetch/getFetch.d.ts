import { FetchActionCreator } from '../defineFetch';
import { DataServiceState } from '../dataServiceReducer';

/**
 * @docs `getFetch`
 *
 * > **Note**: This API is a lower level API for [usage with Redux](../guides/usage-with-redux.md).
 * > We recommend using [`useFetch`](./use-fetch.md) instead of `getFetch` if possible.
 *
 * Given a fetch instance and the whole Redux state, this wil, return the array of `[data, status]`
 * that [`useFetch`](./use-fetch.md) also returns.
 *
 * This function exists for usage with `react-redux`'s `connect` HOC.
 * You can get the `[data, status]` within `mapStateToProps` via `getFetch`.
 */
export default function getFetch<FetchResult, MergeResult>(
  fetchInstance: FetchActionCreator<any, FetchResult, MergeResult>,
  state: { dataService: DataServiceState },
  options?: GetFetchOptions,
): [PickResult<FetchResult, MergeResult> | null, number];

export interface GetFetchOptions {
  isolatedStatus: boolean;
}

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;
