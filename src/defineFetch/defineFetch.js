import shortId from 'shortid';
import createActionType from '../createActionType';
import FETCH from '../prefixes/FETCH';

export function isFetchAction(action) {
  if (!action) return false;
  if (!action.type) return false;
  return action.type.startsWith(FETCH);
}

function memoize(displayName, actionCreatorFactory, make, conflict) {
  // TODO: may need a way to clear this memo
  const memo = {};

  function memoized(...keyArgs) {
    const makeResult = make(...keyArgs);

    if (typeof makeResult !== 'object') {
      throw new Error('[defineFetch]: `make` must return an object');
    }

    const { request } = makeResult;

    if (!keyArgs.every(key => typeof key === 'string' || typeof key === 'number')) {
      const rogueKey = keyArgs.find(key => typeof key !== 'string' && typeof key !== 'number');
      throw new Error(
        `[defineFetch] make arguments must be either a string or a number. Found "${JSON.stringify(
          rogueKey,
        )}" for the fetch factory "${displayName}"`,
      );
    }
    if (typeof request !== 'function') {
      throw new Error(
        '[defineFetch] `request` must be a function in the object that `make` returns`',
      );
    }

    const hash = `key:${[...keyArgs, conflict].join(' | ')}`;

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
      key: `key:${keyArgs.join(' | ')}`,
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
        // TODO: add docs
        throw new Error('[defineFetch] Expected `fetch` to return a curried function');
      }

      // cancellation mechanism
      const canceledRef = { canceled: false }; // pointer used to avoid incorrect value in closures
      const subscribers = [];

      resolvablePayload.cancel = () => {
        canceledRef.canceled = true;

        // don't know there's this false positive
        // https://github.com/eslint/eslint/issues/12117
        // eslint-disable-next-line no-unused-vars
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
      type: 'FETCH_INSTANCE',
    };

    return fetch;
  }

  const memoizedFetchFactory = memoize(displayName, fetchFactory, make, conflict);

  memoizedFetchFactory.meta = {
    fetchFactoryId,
    displayName,
    type: 'FETCH_INSTANCE_FACTORY',
  };

  return memoizedFetchFactory;
}
