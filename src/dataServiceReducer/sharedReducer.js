import _get from 'lodash/get';
import _omit from 'lodash/omit';
import createShareKey from '../createShareKey';
import createStoreKey from '../createStoreKey';
import { isFetchAction } from '../defineFetch';
import { isClearAction } from '../clearFetch';
import { isSuccessAction } from '../createDataServiceMiddleware';

export default function sharedReducer(state = {}, action) {
  if (isFetchAction(action)) {
    const { meta } = action;
    const { displayName, fetchFactoryId, key, share } = meta;

    // only run this reducer if this action is `share`d
    if (!share) return state;

    const { namespace } = share;
    const storeKey = createStoreKey(displayName, fetchFactoryId);
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
    const merge = share.merge || ((_, next) => next);
    const shareKey = createShareKey(namespace, key);

    return {
      ...state,
      [shareKey]: {
        ..._get(state, [shareKey]),
        data: merge(_get(state, [shareKey, 'data']), payload),
      },
    };
  }

  if (isClearAction(action)) {
    const { meta } = action;
    const { key, share } = meta;

    // only run this reducer if this action is `share`d
    if (!share) return state;

    const { namespace } = share;
    const shareKey = createShareKey(namespace, key);

    return _omit(state, shareKey);
  }

  return state;
}
