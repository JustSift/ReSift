import shortId from 'shortid';
import createActionType from '../createActionType';
import FETCH from '../prefixes/FETCH';

export function isFetchAction(action) {
  if (!action) return false;
  if (!action.type) return false;
  return action.type.startsWith(FETCH);
}

function memoize(actionCreatorFactory, make, conflict) {
  // TODO: may need a way to clear this memo
  const memo = {};

  function memoized(...keyArgs) {
    const keyResult = make(...keyArgs);

    if (typeof keyResult !== 'object') {
      throw new Error('[defineFetch]: `make` must return an object');
    }

    const { key, request } = keyResult;

    if (!Array.isArray(key)) {
      throw new Error('[defineFetch] `key` must be an array in the object that `make` returns');
    }
    if (typeof request !== 'function') {
      throw new Error(
        '[defineFetch] `request` must be a function in the object that `make` returns`',
      );
    }

    const hash = `key:${[...key, conflict].join(' | ')}`;

    if (memo[hash]) {
      return memo[hash];
    }

    memo[hash] = actionCreatorFactory(...keyArgs);
    return memo[hash];
  }

  return memoized;
}

export default function defineFetch({
  displayName,
  share,
  conflict = 'cancel',
  make,
  staticFetchFactoryId,
}) {
  const fetchFactoryId = staticFetchFactoryId || shortId();

  if (!displayName) throw new Error('`displayName` is required in `defineFetch`');
  if (!make) throw new Error('`make` is required in `defineFetch`');

  function fetchFactory(...keyArgs) {
    const makeResult = make(...keyArgs);

    const meta = {
      fetchFactoryId,
      key: `key:${makeResult.key.join(' | ')}`,
      displayName,
      share,
      conflict,
    };

    function fetch(...requestArgs) {
      // the `request` is a curried function.
      // this partially applies the user request arguments. the resulting function is a
      // function that takes in the services object and returns a promise of data
      const resolvablePayload = makeResult.request(...requestArgs);

      if (typeof resolvablePayload !== 'function') {
        throw new Error(
          '[defineFetch] expected `fetch` to return a curried function. See https://resift.sift.codes',
        );
      }

      // cancellation mechanism
      const canceledRef = { canceled: false }; // pointer used to avoid incorrect value in closures
      const subscribers = [];

      resolvablePayload.cancel = () => {
        canceledRef.canceled = true;

        for (const subscriber of subscribers) {
          subscriber();
        }
      };

      resolvablePayload.getCanceled = () => canceledRef.canceled;

      resolvablePayload.onCancel = callback => {
        subscribers.push(callback);
      };

      const request = {
        type: createActionType(FETCH, meta),
        meta,
        payload: resolvablePayload,
      };

      return request;
    }

    fetch.meta = {
      ...meta,
      type: 'ACTION_CREATOR',
    };

    return fetch;
  }

  const memoizedFetchFactory = memoize(fetchFactory, make, conflict);

  memoizedFetchFactory.meta = {
    fetchFactoryId,
    displayName,
    type: 'ACTION_CREATOR_FACTORY',
  };

  return memoizedFetchFactory;
}
