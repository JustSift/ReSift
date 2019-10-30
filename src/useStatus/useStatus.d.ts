import { FetchInstance } from '../defineFetch';

/**
 * @docs `useStatus`
 *
 * Returns the status of a fetch given a fetch instance
 *
 * If you pass in `null` (or any other falsy value), you'll get `UNKNOWN` back out
 */
declare function useStatus(fetch: FetchInstance | null): number;

export default useStatus;
