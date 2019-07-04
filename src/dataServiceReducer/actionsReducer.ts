import _get from 'lodash/get';
import createStoreKey from '../createStoreKey';
import timestamp from '../timestamp';
import { FetchAction, isFetchAction } from '../defineFetch';
import {
  SuccessAction,
  ErrorAction,
  isSuccessAction,
  isErrorAction,
} from '../createDataServiceMiddleware';
import { isClearAction, ClearFetchAction } from '../clearFetch';
import { FetchActionMeta } from '../defineFetch';

type ResiftAction =
  | SuccessAction<any, any>
  | ErrorAction<any, any>
  | FetchAction<any, any, any>
  | ClearFetchAction;

export interface ActionState {
  shared: boolean;
  inflight?: Function;
  payload: unknown;
  hadSuccess?: boolean;
  error?: boolean;
  meta: FetchActionMeta<any, any>;
  updatedAt: string;
}

export interface ActionsState {
  [storeKey: string]: {
    [key: string]: ActionState | null;
  };
}

export default function actionsReducer(
  state: ActionsState = {},
  action: ResiftAction,
): ActionsState {
  if (
    !isFetchAction(action) &&
    !isSuccessAction(action) &&
    !isErrorAction(action) &&
    !isClearAction(action)
  ) {
    return state;
  }

  const { meta } = action;
  const { displayName, actionCreatorId, key, share } = meta;

  const storeKey = createStoreKey(displayName, actionCreatorId);

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
          payload: action.payload,
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
          payload: action.payload,
          error: true,
          meta,
          updatedAt: timestamp(),
        },
      },
    };
  }

  if (isClearAction(action)) {
    return {
      ...state,
      [storeKey]: Object.entries(_get(state, [storeKey], {}))
        .filter(([k]) => k !== key)
        .reduce(
          (acc, [key, value]) => {
            acc[key] = value;
            return acc;
          },
          {} as ActionsState[string],
        ),
    };
  }

  return state;
}
