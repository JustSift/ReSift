import { FetchInstance } from '../defineFetch';

/**
 * @docs `useStatus`
 *
 * Returns the status of a fetch given a fetch instance
 *
 * If you pass in `null` (or any other falsy value), you'll get `UNKNOWN` back out
 */
declare function useStatus(fetch: FetchInstance | null, options?: UseStatusOptions): number;

/**
 * @docs `UseStatusOptions`
 */
interface UseStatusOptions {
  /**
   * If this is present, it will only report the status for the current fetch factory (if the fetch factory is shared).
   */
  isolatedStatus?: boolean;
}

export default useStatus;
