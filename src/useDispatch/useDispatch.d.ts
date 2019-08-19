import { FetchAction } from '../defineFetch';

export default function useDispatch(): (fetch: FetchAction) => Promise<any>;
