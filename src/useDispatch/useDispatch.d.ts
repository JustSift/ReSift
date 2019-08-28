import { FetchAction } from '../defineFetch';

/**
 * @docs `useDispatch`
 *
 * A simple hook that returns `dispatch`. Use `dispatch` to dispatch requests from fetch instances.
 *
 * [See here for more info.](../main-concepts/whats-a-fetch.md#making-a-request-then-dispatching-it)
 */
export default function useDispatch(): (fetch: FetchAction) => Promise<any>;
