import React from 'react';
import { FetchActionCreator } from '../defineFetch';

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;

type UseValueHook<FetchResult, MergeResult> = () => [
  (PickResult<FetchResult, MergeResult> | null),
  number,
];

type GlobalFetchProvider = React.ComponentType<{ children: React.ReactNode }>;

type ContextFetchConsumer<FetchResult, MergeResult> = React.ComponentType<{
  children: (params: [PickResult<FetchResult, MergeResult> | null, number]) => React.ReactNode;
}>;

export default function createContextFetch<FetchResult, MergeResult>(
  fetch: FetchActionCreator<any, FetchResult, MergeResult>,
): {
  ContextFetchProvider: GlobalFetchProvider;
  useContextFetch: UseValueHook<FetchResult, MergeResult>;
  ContextFetchConsumer: ContextFetchConsumer<FetchResult, MergeResult>;
};
