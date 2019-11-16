import SUCCESS from '../prefixes/SUCCESS';
import ERROR from '../prefixes/ERROR';
import createActionType from '../createActionType';
import createStoreKey from '../createStoreKey';
import { isFetchAction } from '../defineFetch';

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
export async function handleAction({ state, services, dispatch, action }) {
  const { payload, meta } = action;
  const { displayName, fetchFactoryId, key, conflict } = meta;

  try {
    // `inflight` is the `payload` function of the fetch. it will be defined if there is an action
    // that is currently inflight.
    const storeKey = createStoreKey(displayName, fetchFactoryId);
    const inflight = state?.actions?.[storeKey]?.[key]?.inflight;

    if (inflight) {
      // if the `conflict` key part of `defineFetch` was set to `ignore`, and there was an
      // existing `inflight` request, that means we should simply early return and "ignore" the
      // incoming request
      if (conflict === 'ignore') return;

      // otherwise we should cancel the current request and continue the current request
      inflight.cancel();
      requestsToCancel.add(inflight);
    }

    // goes through all the services and applies the cancellation mechanism
    const servicesWithCancel = Object.entries(services).reduce(
      (services, [serviceKey, service]) => {
        services[serviceKey] = service({
          getCanceled: payload.getCanceled,
          onCancel: payload.onCancel,
        });
        return services;
      },
      {},
    );

    // this try-catch set is only to ignore canceled errors
    // it re-throws any other error
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
      if (error.isCanceledError) return;
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

  return (state, dispatch, action) => {
    if (!isFetchAction(action)) {
      return;
    }

    const actionPromise = handleAction({
      state,
      services,
      dispatch,
      action,
    }).catch(e => {
      onError(e);
      // when awaiting dispatch...
      //    👇 this is the error that will propagate to the awaiter
      throw e;
    });

    return actionPromise;
  };
}