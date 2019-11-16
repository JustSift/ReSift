import { useMemo, useContext } from 'react';
import StateContext from '../StateContext';
import SubscriptionContext from '../SubscriptionContext';
import { useContextSelector } from 'use-context-selector';
import createStoreKey from '../createStoreKey';

const makeDataSelector = fetch => state => {
  if (!fetch) {
    return null;
  }

  const isFetchInstance = fetch?.meta?.type === 'FETCH_INSTANCE';
  if (!isFetchInstance) {
    throw new Error('[useData] expected to see a fetch instance.');
  }

  const { fetchFactoryId, displayName, key, share } = fetch.meta;

  const storeKey = createStoreKey(displayName, fetchFactoryId);

  const value = state?.actions?.[storeKey]?.[key];

  // if the fetch is _not_ shared, continue down this code path.
  // in this path, all we do is return the "non-shared" value and the "non-shared" state from the
  // `actions` sub-store (vs the `shared` sub-store)
  if (!share) {
    if (!value) return null;
    return value.data === undefined ? null : value.data;
  }

  // otherwise if the fetch _is_ shared, then continue down this code path
  const { namespace } = share;

  // the value comes from the `shared` sub-store instead of the `actions` sub-store
  const sharedData = state?.shared?.data?.[namespace]?.[key] || null;
  return sharedData;
};

function useData(fetch) {
  const dataSelector = useMemo(() => makeDataSelector(fetch), [fetch]);
  const data = useContextSelector(StateContext, dataSelector);
  const subscribe = useContext(SubscriptionContext);

  if (!data) {
    throw new Promise(resolve => {
      const unsubscribe = subscribe(state => {
        const data = dataSelector(state);
        if (data) {
          resolve();
          unsubscribe();
        }
      });
    });
  }

  return data;
}

export default useData;
