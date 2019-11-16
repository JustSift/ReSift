import { useContext, useCallback } from 'react';
import DispatchContext from '../DispatchContext';
import CLEAR from '../prefixes/CLEAR';

export default function useDispatch() {
  const dispatch = useContext(DispatchContext);
  if (!dispatch) {
    throw new Error(
      '[useDispatch] Could not find the respective context. In order to `useDispatch` you must add the respective provider. https://resift.org/docs/introduction/installation#adding-the-resiftprovider',
    );
  }
  if (process.env.NODE_ENV === 'production') return dispatch;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useCallback(
    action => {
      const isFetchInstance = action?.meta?.type === 'FETCH_INSTANCE';
      const isFetchFactory = action?.meta?.type === 'FETCH_INSTANCE_FACTORY';
      const isClearAction = (action?.type || '').startsWith(CLEAR);

      if (isFetchInstance && !isClearAction) {
        // TODO: add docs for this
        throw new Error(
          "[useDispatch] You dispatched a fetch instance without calling it when you should've dispatched a request.",
        );
      }
      if (isFetchFactory) {
        throw new Error(
          // TODO: add docs for this
          "[useDispatch] You dispatched a fetch factory when you should've dispatched a request.",
        );
      }

      return dispatch(action);
    },
    [dispatch],
  );
}
