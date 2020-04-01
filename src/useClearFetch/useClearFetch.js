import { useCallback } from 'react';
import useDispatch from '../useDispatch';
import clearFetch from '../clearFetch';

export default function useClearFetch() {
  const dispatch = useDispatch();

  return useCallback(
    (fetch) => {
      dispatch(clearFetch(fetch));
    },
    [dispatch],
  );
}
