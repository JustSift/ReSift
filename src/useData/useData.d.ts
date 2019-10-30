import { FetchInstance } from '../defineFetch';

/**
 * @docs `useData`
 *
 * Grabs the data out of the `FetchInstance`. This function may return `null`
 * if there is no data available yet.
 *
 * If you pass in `null` (or any other falsy value), you'll get `null` back out
 */
declare function useData<FetchArgs extends any[], Data = any>(
  fetch: FetchInstance<FetchArgs, Data> | null,
): Data | null;

export default useData;
