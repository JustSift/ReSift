import React from 'react';
import { FetchInstance } from '../defineFetch';

/**
 * @docs `createContextFetch`
 *
 * Context fetches are deprecated given that we'll probably switch to a complete
 * context implementation to support concurrent mode.
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
