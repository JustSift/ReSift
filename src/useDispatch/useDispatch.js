import { useContext, useCallback } from 'react';
import _get from 'lodash/get';
import { ReactReduxContext } from 'react-redux';
import CLEAR from '../prefixes/CLEAR';

export default function useDispatch() {
  const { store } = useContext(ReactReduxContext);
  if (!store) {
    throw new Error(
      'could not find store in context. in order to `useDispatch` you must add `ReduxProvider` from resift',
    );
  }

  if (process.env.NODE_ENV === 'production') return store.dispatch;

  return useCallback(
    action => {
      const isActionCreator = _get(action, ['meta', 'type']) === 'ACTION_CREATOR';
      const isActionCreatorFactory = _get(action, ['meta', 'type']) === 'ACTION_CREATOR_FACTORY';
      const isClearAction = _get(action, ['type'], '').startsWith(CLEAR);

      if (isActionCreator && !isClearAction) {
        throw new Error('[dispatch] you dispatched a fetch. Ask rico until he writes docs.');
      }
      if (isActionCreatorFactory) {
        throw new Error('[dispatch] you dispatched a make fetch. Ask rico until he writes docs.');
      }

      return store.dispatch(action);
    },
    [store],
  );
}
