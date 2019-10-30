import { FetchInstance, FetchActionMeta } from '../defineFetch';

/**
 * @docs `clearFetch`
 *
 * Given a fetch instance, it returns an object that can be dispatched using `useDispatch` or Redux's
 * `store.dispatch`.
 *
 * > It's recommended to use [`useClearFetch`](./use-clear-fetch.md) instead of this function.
 */
export default function clearFetch(fetch: FetchInstance): ClearFetchAction;
export interface ClearFetchAction {
  type: string;
  meta: FetchActionMeta;
}
export function isClearAction(action: any): action is ClearFetchAction;
