import { useDispatch as useReduxDispatch } from 'react-redux';
import _get from 'lodash/get';
import CLEAR from '../prefixes/CLEAR';

export default function useDispatch() {
  const dispatch = useReduxDispatch();
  if (process.env.NODE_ENV === 'production') return dispatch;

  return action => {
    const isActionCreator = _get(action, ['meta', 'type']) === 'ACTION_CREATOR';
    const isActionCreatorFactory = _get(action, ['meta', 'type']) === 'ACTION_CREATOR_FACTORY';
    const isClearAction = _get(action, ['type'], '').startsWith(CLEAR);

    if (isActionCreator && !isClearAction) {
      throw new Error('[dispatch] you dispatched a fetch. Ask rico until he writes docs.');
    }
    if (isActionCreatorFactory) {
      throw new Error('[dispatch] you dispatched a make fetch. Ask rico until he writes docs.');
    }

    return dispatch(action);
  };
}
