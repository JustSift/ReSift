import _get from 'lodash/get';
import createShareKey from '../createShareKey';
import createStoreKey from '../createStoreKey';
import { isFetchAction } from '../defineFetch';
import { isSuccessAction } from '../createDataServiceMiddleware';

export default function sharedReducer(state = {}, action) {
  if (isFetchAction(action)) {
    const { meta } = action;
    const { displayName, actionCreatorId, key, share } = meta;

    // only run this reducer if this action is `share`d
    if (!share) return state;

    const { namespace } = share;
    const storeKey = createStoreKey(displayName, actionCreatorId);
    const shareKey = createShareKey(namespace, key);
    const storePathHash = [storeKey, key].join(' | ');

    return {
      ...state,
      [shareKey]: {
        ..._get(state, [shareKey]),
        parentActions: {
          ..._get(state, [shareKey, 'parentActions']),
          [storePathHash]: { storeKey, key },
        },
      },
    };
  }

  if (isSuccessAction(action)) {
    const { meta, payload } = action;
    const { key, share } = meta;

    // only run this reducer if this action is `share`d
    if (!share) return state;

    const { namespace } = share;
    const combine = share.combine || ((_, next) => next);
    const shareKey = createShareKey(namespace, key);

    return {
      ...state,
      [shareKey]: {
        ..._get(state, [shareKey]),
        data: combine(_get(state, [shareKey, 'data']), payload),
      },
    };
  }

  return state;
}
