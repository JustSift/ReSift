import React from 'react';
import { FetchInstance } from '../defineFetch';

/**
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

type GlobalFetchProvider = React.ComponentType<{ children: React.ReactNode }>;

type UseValueHook<Data = any> = () => [Data | null, number];

type ContextFetchConsumer<Data> = React.ComponentType<{
  children: (params: [Data | null, number]) => React.ReactNode;
}>;
