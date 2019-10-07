import React from 'react';
import { FetchActionCreator } from '../defineFetch';

/**
 * @docs `createContextFetch`
 * Creates a [context fetch](../guides/context-fetches.md).
 *
 * Please [see this doc](../guides/context-fetches.md) to read more about context fetches.
 */
export default function createContextFetch<FetchResult, MergeResult>(
  fetch: FetchActionCreator<any, FetchResult, MergeResult>,
): {
  ContextFetchProvider: GlobalFetchProvider;
  useContextFetch: UseValueHook<FetchResult, MergeResult>;
  ContextFetchConsumer: ContextFetchConsumer<FetchResult, MergeResult>;
};

/**
 * @docs `GlobalFetchProvider`
 */
type GlobalFetchProvider = React.ComponentType<{ children: React.ReactNode }>;

/**
 * @docs `UseValueHook`
 */
type UseValueHook<FetchResult, MergeResult> = () => [
  (PickResult<FetchResult, MergeResult> | null),
  number,
];

/**
 * @docs `ContextFetchConsumer`
 */
type ContextFetchConsumer<FetchResult, MergeResult> = React.ComponentType<{
  children: (params: [PickResult<FetchResult, MergeResult> | null, number]) => React.ReactNode;
}>;

type Unwrap<T> = T extends Promise<infer U> ? U : T;

type PickResult<FetchResult, MergeResult> = unknown extends MergeResult
  ? Unwrap<FetchResult>
  : Unwrap<MergeResult>;
