import { useMemo } from 'react';
import getFetch, { GetFetchOptions } from '../getFetch';
import shallowEqual from '../shallowEqual';
import { FetchActionCreator } from '../defineFetch';
import { DataServiceState } from '../dataServiceReducer';

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;

export default function useFetch<FetchResult, MergeResult>(
  fetch: FetchActionCreator<any, FetchResult, MergeResult>,
  options?: GetFetchOptions,
): [PickResult<FetchResult, MergeResult> | null, number];
