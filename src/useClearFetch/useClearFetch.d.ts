import { FetchInstance } from '../defineFetch';

/**
 * @docs `useClearFetch`
 *
 * Returns `clearFetch` — a function that you can call to remove the cached values in ReSift.
 *
 * Example usage:
 *
 * ```js
 * function ExampleComponent({ personId }) {
 *   const personFetch = makePersonFetch(personId);
 *   const clearFetch = useClearFetch();
 *   const dispatch = useDispatch();
 *
 *   useEffect(() => {
 *     dispatch(personFetch());
 *
 *     // `clearFetch` fits in well with React's `useEffect`'s clean-up phase
 *     // (note: you only need to clean up if you wish to remove the cached value)
 *     return () => clearFetch(personFetch);
 *   }, [personFetch]);
 *
 *   return // ...
 * }
 * ```
 *
 * `useClearFetch` signature:
 */
export default function useClearFetch(): (fetch: FetchInstance) => any;
