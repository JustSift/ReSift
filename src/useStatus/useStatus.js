import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import _get from 'lodash/get';
import _flatten from 'lodash/flatten';
import createStoreKey from '../createStoreKey';
import UNKNOWN from '../UNKNOWN';
import LOADING from '../LOADING';
import ERROR from '../ERROR';
import NORMAL from '../NORMAL';
import isUnknown from '../isUnknown';
import isLoading from '../isLoading';
import isError from '../isError';
import isNormal from '../isNormal';
import usePreserveReference from 'use-preserve-reference';

// Combining shared statuses is different because of the `normal` case.
//
// With non-shared statuses, the default behavior is only make `isNormal` return true if all the
// statuses are normal. This is because there could be a loader blocking render until all pieces of
// data come back.
//
// With shared statuses, it makes sense to have `isNormal` return true if only one status is normal
// (vs all). This is because the shared fetches share the same internal store so if one fetch has
// the data, it's sufficient for all of them.
export function combineSharedStatuses(...statuses) {
  if (statuses.every(status => isUnknown(status))) {
    return UNKNOWN;
  }

  const loading = isLoading(...statuses) ? LOADING : UNKNOWN;

  const normal = statuses.some(status => isNormal(status)) ? NORMAL : UNKNOWN;

  const error = isError(...statuses) ? ERROR : UNKNOWN;

  return loading | normal | error;
}

export function getStatus(actionState) {
  if (!actionState) return UNKNOWN;

  const { hadSuccess, inflight, error } = actionState;

  const inflightStatus = inflight ? LOADING : UNKNOWN;
  const errorStatus = error ? ERROR : UNKNOWN;
  const normalStatus = hadSuccess && !error ? NORMAL : UNKNOWN;

  return inflightStatus | errorStatus | normalStatus;
}

export const makeStatusSelector = (fetch, options) => state => {
  if (!fetch) {
    return UNKNOWN;
  }

  const isFetchInstance = _get(fetch, ['meta', 'type']) === 'FETCH_INSTANCE';
  if (!isFetchInstance) {
    throw new Error('[useStatus] expected to see a fetch instance in get fetch.');
  }

  if (!state.dataService) {
    throw new Error(
      '[useStatus] "dataService" is a required key. Double check with the installation guide here: https://resift.org/docs/introduction/installation',
    );
  }

  const { fetchFactoryId, displayName, key, share } = fetch.meta;
  const storeKey = createStoreKey(displayName, fetchFactoryId);

  const value = _get(state, ['dataService', 'actions', storeKey, key]);
  const nonSharedStatus = getStatus(value);

  // if the fetch is _not_ shared, continue down this code path.
  // in this path, all we do is return the "non-shared" value and the "non-shared" state from the
  // `actions` sub-store (vs the `shared` sub-store)
  if (!share) {
    return nonSharedStatus;
  }

  // otherwise if the fetch _is_ shared, then continue down this code path
  const { namespace, mergeObj } = share;

  const shouldReturnIsolatedStatus = _get(options, ['isolatedStatus'], false);

  // if the user put in `isolatedStatus: true` in their options then we should return the status
  // derived from the `actions` sub-store
  if (shouldReturnIsolatedStatus) {
    return nonSharedStatus;
  }

  // otherwise do all the stuff below to get the shared status
  const targetNamespaces = Object.keys(mergeObj);

  // `parentLocations` are paths to the state in the `actions` sub-store
  const parentLocationsFromTheSameNamespace = _flatten(
    targetNamespaces
      .map(targetNamespace => {
        const parentLocations = _get(state, ['dataService', 'shared', 'parents', targetNamespace]);
        if (!parentLocations) {
          return null;
        }

        if (targetNamespace !== namespace) {
          return null;
        }

        const validParentLocations = Object.values(parentLocations).filter(
          parentLocation => parentLocation.key === key,
        );

        return validParentLocations;
      })
      .filter(x => !!x),
  );

  const parentLocationsFromDifferentNamespaces = _flatten(
    targetNamespaces
      .map(targetNamespace => {
        const parentLocations = _get(state, ['dataService', 'shared', 'parents', targetNamespace]);
        if (!parentLocations) {
          return null;
        }

        if (targetNamespace === namespace) {
          return null;
        }

        return Object.values(parentLocations);
      })
      .filter(x => !!x),
  );

  // this takes all those paths and grabs the action sub-state.
  // this sub-state is ran through `getStatus` which returns the corresponding status for the
  // sub-state.
  const sharedStatusesFromSameNamespace = parentLocationsFromTheSameNamespace
    .map(parentLocation => {
      const storeKey = createStoreKey(parentLocation.displayName, parentLocation.fetchFactoryId);
      const parentAction = _get(state, ['dataService', 'actions', storeKey, parentLocation.key]);

      return getStatus(parentAction);
    })
    .filter(x => x !== null);

  const sharedStatuesFromDifferentNamespaces = parentLocationsFromDifferentNamespaces
    .map(parentLocation => {
      const storeKey = createStoreKey(parentLocation.displayName, parentLocation.fetchFactoryId);
      const parentAction = _get(state, ['dataService', 'actions', storeKey, parentLocation.key]);

      return getStatus(parentAction);
    })
    .filter(x => x !== null);

  const otherNamespaceLoading = sharedStatuesFromDifferentNamespaces.some(status =>
    isLoading(status),
  )
    ? LOADING
    : UNKNOWN;

  // all of those status are folded into one shared status
  const sharedStatus =
    otherNamespaceLoading | combineSharedStatuses(...sharedStatusesFromSameNamespace);

  return sharedStatus;
};

function useStatus(fetch, options) {
  const preservedOptions = usePreserveReference(options);
  const statusSelector = useMemo(() => makeStatusSelector(fetch, preservedOptions), [
    fetch,
    preservedOptions,
  ]);
  return useSelector(statusSelector);
}

export default useStatus;
