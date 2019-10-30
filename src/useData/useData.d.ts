import { FetchInstance } from '../defineFetch';

/**
 * @docs `useData`
 *
 * Grabs the data out of the `FetchInstance`. This function may return `null`
 * if there is no data available yet.
 */
declare function useData<FetchArgs extends any[], Data = any>(
  fetch: FetchInstance<FetchArgs, Data>,
): Data | null;

export default useData;
