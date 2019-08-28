import { GetFetchOptions } from '../getFetch';
import { FetchActionCreator } from '../defineFetch';

/**
 * @docs `useFetch`
 *
 * You can pull data and its associated status out of a fetch using `useFetch`.
 *
 * [See here for more info.](../main-concepts/whats-a-fetch.md#making-a-fetch-and-pulling-data-from-it)
 *
 * > **Note**: `useFetch` also expects falsy values (e.g. `null` or `undefined`) and will return
 * > `[null, UNKNOWN]`. This was to allow for conditionally creating fetch instances but not
 * > conditionally calling `useFetch` (which breaks the rules of hooks).
 */
export default function useFetch<FetchResult, MergeResult>(
  fetch: undefined | null | FetchActionCreator<any, FetchResult, MergeResult>,
  options?: GetFetchOptions,
): [PickResult<FetchResult, MergeResult> | null, number];

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;
