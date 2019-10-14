import { useMemo } from 'react';
import _get from 'lodash/get';
import { useSelector } from 'react-redux';
import createStoreKey from '../createStoreKey';

const makeDataSelector = fetch => state => {
  if (!fetch) {
    return null;
  }

  const isFetchInstance = _get(fetch, ['meta', 'type']) === 'FETCH_INSTANCE';
  if (!isFetchInstance) {
    throw new Error('[useData] expected to see a fetch instance in get fetch.');
  }

  if (!state.dataService) {
    throw new Error(
      '[useData] "dataService" is a required key. Double check with the installation guide here: https://resift.org/docs/introduction/installation',
    );
  }

  const { fetchFactoryId, displayName, key, share } = fetch.meta;

  const storeKey = createStoreKey(displayName, fetchFactoryId);

  const value = _get(state, ['dataService', 'actions', storeKey, key]);

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
  const sharedData = _get(state, ['dataService', 'shared', 'data', namespace, key], null);
  return sharedData;
};

function useData(fetch) {
  const dataSelector = useMemo(() => makeDataSelector(fetch), [fetch]);
  return useSelector(dataSelector);
}

export default useData;
