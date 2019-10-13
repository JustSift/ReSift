import _get from 'lodash/get';
import _flatten from 'lodash/flatten';
import createStoreKey from '../createStoreKey';

import isUnknown from '../isUnknown';
import isLoading from '../isLoading';
import isNormal from '../isNormal';
import isError from '../isError';

import UNKNOWN from '../UNKNOWN';
import LOADING from '../LOADING';
import ERROR from '../ERROR';
import NORMAL from '../NORMAL';
import combineStatuses from '../combineStatuses';

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

export default function getFetch(fetch, state, options) {
  if (!fetch) throw new Error('[getFetch] First argument, the fetch, is required');
  if (!state) throw new Error('[getFetch] State argument is required');
  if (!state.dataService) {
    throw new Error('[getFetch] "dataService" is a required key. pass in the whole store state.');
  }

  const isFetchInstance = _get(fetch, ['meta', 'type']) === 'FETCH_INSTANCE';
  if (!isFetchInstance) {
    throw new Error('[getFetch] expected to see a fetch instance in get fetch.');
  }

  const { fetchFactoryId, displayName, key, share } = fetch.meta;

  const storeKey = createStoreKey(displayName, fetchFactoryId);

  const value = _get(state, ['dataService', 'actions', storeKey, key]);
  const nonSharedStatus = getStatus(value);

  // if the fetch is _not_ shared, continue down this code path.
  // in this path, all we do is return the "non-shared" value and the "non-shared" state from the
  // `actions` sub-store (vs the `shared` sub-store)
  if (!share) {
    // if there is no value, then all we can do is return null and UNKNOWN
    if (!value) return [null, UNKNOWN];

    const data = value.error ? null : value.payload;

    return [data, nonSharedStatus];
  }

  // otherwise if the fetch _is_ shared, then continue down this code path
  const { namespace, mergeObj } = share;

  // the value comes from the `shared` sub-store instead of the `actions` sub-store
  const sharedData = _get(state, ['dataService', 'shared', 'data', namespace, key]);
  const shouldReturnIsolatedStatus = _get(options, ['isolatedStatus'], false);

  // if the user put in `isolatedStatus: true` in their options then we should return the status
  // derived from the `actions` sub-store
  if (shouldReturnIsolatedStatus) {
    return [sharedData, nonSharedStatus];
  }

  // otherwise do all the stuff below to get the shared status
  const targetNamespaces = Object.keys(mergeObj);

  // `parentLocations` are paths to the state in the `actions` sub-store
  const parentLocationsFromTheSameNamespace = _flatten(
    targetNamespaces
      .map(targetNamespace => {
        const parentLocations = _get(state, ['dataService', 'shared', 'parents', namespace]);
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
        const parentLocations = _get(state, ['dataService', 'shared', 'parents', namespace]);
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

  const sharedStatuesFromDifferentNamespace = parentLocationsFromDifferentNamespaces
    .map(parentLocation => {
      const storeKey = createStoreKey(parentLocation.displayName, parentLocation.fetchFactoryId);
      const parentAction = _get(state, ['dataService', 'actions', storeKey, parentLocation.key]);

      return getStatus(parentAction);
    })
    .filter(x => x !== null);

  // all of those status are folded into one shared status
  const sharedStatus = combineStatuses(
    ...sharedStatuesFromDifferentNamespace,
    combineSharedStatuses(...sharedStatusesFromSameNamespace),
  );

  return [sharedData, sharedStatus];
}
