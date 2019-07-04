import useDispatch from '../useDispatch';
import clearFetch from '../clearFetch';
import { FetchActionCreator } from '../defineFetch';

export default function useClearFetch() {
  const dispatch = useDispatch();

  return (fetch: FetchActionCreator<any, any, any>) => {
    dispatch(clearFetch(fetch));
  };
}
