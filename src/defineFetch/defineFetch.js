import shortId from 'shortid';
import createActionType from '../createActionType';
import FETCH from '../prefixes/FETCH';

export function isFetchAction(action) {
  if (!action) return false;
  if (!action.type) return false;
  return action.type.startsWith(FETCH);
}

function memoize(actionCreatorFactory, make, conflict) {
  const memo = {};

  function memoized(...keyArgs) {
    const keyResult = make(...keyArgs);

    if (typeof keyResult !== 'object') {
      throw new Error('[defineFetch]: `make` must return an object');
    }

    const { key, fetch } = keyResult;

    if (!Array.isArray(key)) {
      throw new Error('[defineFetch] `key` must be an array in the object that `make` returns');
    }
    if (typeof fetch !== 'function') {
      throw new Error(
        '[defineFetch] `fetch` must be a function in the object that `make` returns`',
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

export default function defineFetch({ displayName, share, conflict = 'cancel', make }) {
  const actionCreatorId = shortId();

  if (!displayName) throw new Error('`displayName` is required in `defineFetch`');
  if (!make) throw new Error('`make` is required in `defineFetch`');

  function actionCreatorFactory(...keyArgs) {
    const keyResult = make(...keyArgs);

    const { key, fetch } = keyResult;
    const meta = {
      actionCreatorId,
      key: `key:${key.join(' | ')}`,
      displayName,
      share,
      conflict,
    };

    function actionCreator(...fetchArgs) {
      // the `fetch` is a curried function.
      // this partially applies the action creator arguments. the resulting `action` function is a
      // function that takes in the services object and returns a promise of data
      const resolvablePayload = fetch(...fetchArgs);

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

      resolvablePayload.getCancelled = () => canceledRef.canceled;

      resolvablePayload.onCancel = callback => {
        subscribers.push(callback);
      };

      return {
        type: createActionType(FETCH, meta),
        meta,
        payload: resolvablePayload,
      };
    }

    actionCreator.meta = {
      ...meta,
      type: 'ACTION_CREATOR',
    };

    return actionCreator;
  }

  const memoizedActionCreatorFactory = memoize(actionCreatorFactory, make, conflict);

  memoizedActionCreatorFactory.meta = {
    actionCreatorId,
    displayName,
    type: 'ACTION_CREATOR_FACTORY',
  };

  return memoizedActionCreatorFactory;
}
