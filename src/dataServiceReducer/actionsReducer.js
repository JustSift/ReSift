import _get from 'lodash/get';
import createStoreKey from '../createStoreKey';
import timestamp from '../timestamp';
import { isFetchAction } from '../defineFetch';
import { isSuccessAction, isErrorAction } from '../createDataService';
import { isClearAction } from '../clearFetch';

export default function actionsReducer(state = {}, action) {
  if (
    !isFetchAction(action) &&
    !isSuccessAction(action) &&
    !isErrorAction(action) &&
    !isClearAction(action)
  ) {
    return state;
  }

  const { meta } = action;
  const { displayName, fetchFactoryId, key, share } = meta;

  const storeKey = createStoreKey(displayName, fetchFactoryId);

  if (isFetchAction(action)) {
    return {
      ...state,
      [storeKey]: {
        ...state[storeKey],
        [key]: {
          ..._get(state, [storeKey, key]),
          shared: !!share,
          inflight: action.payload,
          meta,
          updatedAt: timestamp(),
        },
      },
    };
  }

  if (isSuccessAction(action)) {
    return {
      ...state,
      [storeKey]: {
        ...state[storeKey],
        [key]: {
          ..._get(state, [storeKey, key]),
          inflight: undefined,
          shared: !!share,
          hadSuccess: true,
          data: action.payload,
          errorData: null,
          error: false,
          meta,
          updatedAt: timestamp(),
        },
      },
    };
  }

  if (isErrorAction(action)) {
    return {
      ...state,
      [storeKey]: {
        ...state[storeKey],
        [key]: {
          ..._get(state, [storeKey, key]),
          inflight: undefined,
          shared: !!share,
          errorData: action.payload,
          error: true,
          meta,
          updatedAt: timestamp(),
        },
      },
    };
  }

  // otherwise must be a clear action because of the first if statement
  return {
    ...state,
    [storeKey]: Object.entries(_get(state, [storeKey], {}))
      .filter(([k]) => k !== key)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {}),
  };
}
