import { FetchInstance } from '../defineFetch';

declare function useFetch<FetchArgs extends any[], Data = any>(
  fetch: FetchInstance<FetchArgs, Data>,
  options?: any,
): [Data | null, number];

export default useFetch;
