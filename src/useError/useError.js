import { useMemo } from 'react';
import StateContext from '../StateContext';
import { useContextSelector } from 'use-context-selector';
import createStoreKey from '../createStoreKey';

const makeErrorSelector = fetch => state => {
  if (!fetch) {
    return null;
  }

  const isFetchInstance = fetch?.meta?.type === 'FETCH_INSTANCE';
  if (!isFetchInstance) {
    throw new Error('[useError] expected to see a fetch instance.');
  }

  if (!state.dataService) {
    throw new Error(
      '[useError] "dataService" is a required key. Double check with the installation guide here: https://resift.org/docs/introduction/installation',
    );
  }
  const { fetchFactoryId, displayName, key } = fetch.meta;

  const storeKey = createStoreKey(displayName, fetchFactoryId);

  const value = state?.dataService?.actions?.[storeKey]?.[key];

  if (!value) {
    return null;
  }

  if (value.errorData === undefined) {
    return null;
  }

  return value.errorData;
};

function useError(fetch) {
  const errorSelector = useMemo(() => makeErrorSelector(fetch), [fetch]);
  const error = useContextSelector(StateContext, errorSelector);
  return error;
}

export default useError;
