import _get from 'lodash/get';
import SUCCESS from '../prefixes/SUCCESS';
import ERROR from '../prefixes/ERROR';
import createActionType from '../createActionType';
import createStoreKey from '../createStoreKey';
import { isFetchAction } from '../defineFetch';
import CancelledError from '../CancelledError';

export function isSuccessAction(action) {
  if (typeof action !== 'object') return false;
  if (typeof action.type !== 'string') return false;
  return action.type.startsWith(SUCCESS);
}

export function isErrorAction(action) {
  if (typeof action !== 'object') return false;
  if (typeof action.type !== 'string') return false;
  return action.type.startsWith(ERROR);
}

const requestsToCancel = new WeakSet();

// function exists simply to encapsulate async/awaits
export async function handleAction({ state, services, dispatch, action, getState }) {
  const { payload, meta } = action;
  const { displayName, actionCreatorId, key, conflict } = meta;

  try {
    // `inflight` is the `payload` function of the fetch. it will be defined if there is an action
    // that is currently inflight.
    const storeKey = createStoreKey(displayName, actionCreatorId);
    const inflight = _get(state, ['actions', storeKey, key, 'inflight']);

    if (inflight) {
      // if the `conflict` key part of `defineFetch` was set to `ignore`, and there was an
      // existing `inflight` request, that means we should simply early return and "ignore" the
      // incoming request
      if (conflict === 'ignore') return;

      // otherwise we should cancel the current request and continue the current request
      inflight.cancel();
      requestsToCancel.add(inflight);
    }

    const dispatchService = action => {
      if (payload.getCancelled()) {
        throw new CancelledError();
      }
      return dispatch(action);
    };

    const getStateService = () => {
      if (payload.getCancelled()) {
        throw new CancelledError();
      }
      return getState();
    };

    // goes through all the services and applies the cancellation mechanism
    const servicesWithCancel = Object.entries(services).reduce(
      (services, [serviceKey, service]) => {
        services[serviceKey] = service({
          getCancelled: payload.getCancelled,
          onCancel: payload.onCancel,
        });
        return services;
      },
      // start with the `dispatch` service and `getState` service (resift provides these by default)
      {
        dispatch: dispatchService,
        getState: getStateService,
      },
    );

    try {
      const resolved = await payload(servicesWithCancel);
      // since we can't cancel promises, we'll just check if the function was canceled and then
      // not dispatch success effectively "canceling" it
      if (requestsToCancel.has(payload)) return;

      const successAction = {
        type: createActionType(SUCCESS, meta),
        meta,
        payload: resolved,
      };

      dispatch(successAction);
    } catch (error) {
      // it's possible that the `payload` function would reject because of a canceled request.
      // in this case, we'll ignore the request because we were gonna ignore it anyway
      if (error.isCancelledError) return;
      if (requestsToCancel.has(payload)) return;

      throw error;
    }
  } catch (error) {
    const errorAction = {
      type: createActionType(ERROR, meta),
      meta,
      payload: error,
      error: true,
    };

    dispatch(errorAction);

    throw error; // this allows the `onError` callback to fire below
  }
}

export default function createDataService({ services, onError }) {
  if (!services) throw new Error('`services` key required');
  if (!onError) throw new Error('`onError` callback required');

  return store => next => action => {
    if (!isFetchAction(action)) {
      return next(action);
    }

    handleAction({
      state: store.getState().dataService,
      services,
      dispatch: store.dispatch,
      action,
      getState: store.getState,
    }).catch(onError);

    return next(action);
  };
}
