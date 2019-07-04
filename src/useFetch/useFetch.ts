import { useMemo } from 'react';
import useRedux from '../useRedux';
import getFetch, { GetFetchOptions } from '../getFetch';
import shallowEqual from '../shallowEqual';
import { FetchActionCreator } from '../defineFetch';
import { DataServiceState } from '../dataServiceReducer';

const neverCalculated = '__NEVER_CALCULATED__';

function memoize<T extends Function>(fn: T): T {
  let previous: any = neverCalculated;

  function returnPreviousIfUnchanged(...args: any[]) {
    const next = fn(...args);
    if (shallowEqual(next, previous)) return previous;
    previous = next;
    return next;
  }

  return (returnPreviousIfUnchanged as any) as T;
}

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;

export default function useFetch<FetchResult, MergeResult>(
  fetch: FetchActionCreator<any, FetchResult, MergeResult>,
  options?: GetFetchOptions,
): [PickResult<FetchResult, MergeResult> | null, number] {
  const memoizedGetFetch = useMemo(() => memoize(getFetch), [
    fetch.meta.actionCreatorId,
    fetch.meta.key,
  ]);

  return useRedux<
    { dataService: DataServiceState },
    [PickResult<FetchResult, MergeResult> | null, number]
  >(state => memoizedGetFetch(fetch, state, options) as any, [
    fetch.meta.actionCreatorId,
    fetch.meta.key,
  ]);
}
