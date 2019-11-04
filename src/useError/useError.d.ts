import { FetchInstance } from '../defineFetch';

/**
 * @docs `useError`
 *
 * Returns the associated error or `null`.
 * See the [error handling doc](../main-concepts/error-handling.md#the-useerror-hook)
 * for more info.
 */
declare function useError(fetch: FetchInstance): any;

export default useError;
