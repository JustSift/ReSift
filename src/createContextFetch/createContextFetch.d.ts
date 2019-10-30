import React from 'react';
import { FetchInstance } from '../defineFetch';

/**
 * @docs `createContextFetch`
 * Creates a [context fetch](../guides/context-fetches.md).
 *
 * Please [see this doc](../guides/context-fetches.md) to read more about context fetches.
 */
export default function createContextFetch<Data = any>(
  fetch: FetchInstance<any[], Data>,
): {
  ContextFetchProvider: GlobalFetchProvider;
  useContextFetch: UseValueHook<Data>;
  ContextFetchConsumer: ContextFetchConsumer<Data>;
};

/**
 * @docs `GlobalFetchProvider`
 */
type GlobalFetchProvider = React.ComponentType<{ children: React.ReactNode }>;

/**
 * @docs `UseValueHook`
 */
type UseValueHook<Data = any> = () => [Data | null, number];

/**
 * @docs `ContextFetchConsumer`
 */
type ContextFetchConsumer<Data> = React.ComponentType<{
  children: (params: [Data | null, number]) => React.ReactNode;
}>;
