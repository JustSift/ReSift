import useDispatch from '../useDispatch';
import clearFetch from '../clearFetch';

export default function useClearFetch() {
  const dispatch = useDispatch();

  return fetch => {
    dispatch(clearFetch(fetch));
  };
}
