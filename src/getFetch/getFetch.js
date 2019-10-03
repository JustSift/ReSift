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

  if (!share) {
    if (!value) return [null, UNKNOWN];

    const data = value.error ? null : value.payload;

    return [data, nonSharedStatus];
  }

  const { namespace, mergeObj } = share;
  const sharedData = _get(state, ['dataService', 'shared', 'data', namespace, key]);
  const isolatedStatus = _get(options, ['isolatedStatus'], false);

  if (isolatedStatus) {
    return [sharedData, nonSharedStatus];
  }

  const targetNamespaces = Object.keys(mergeObj);

  const parentLocations = _flatten(
    targetNamespaces
      .map(targetNamespace => {
        const parentLocations = _get(state, ['dataService', 'shared', 'parents', namespace]);
        if (!parentLocations) {
          return null;
        }

        if (targetNamespace === namespace) {
          const validParentLocations = Object.values(parentLocations).filter(
            parentLocation => parentLocation.key === key,
          );

          return validParentLocations;
        }

        return Object.values(parentLocations);
      })
      .filter(x => !!x),
  );

  const sharedStatuses = parentLocations
    .map(parentLocation => {
      const storeKey = createStoreKey(parentLocation.displayName, parentLocation.fetchFactoryId);
      const parentAction = _get(state, ['dataService', 'actions', storeKey, parentLocation.key]);
      if (!parentAction) {
        return null;
      }

      return getStatus(getStatus);
    })
    .filter(x => x !== null);

  const sharedStatus = combineSharedStatuses(...sharedStatuses);

  return [sharedData, isolatedStatus ? getStatus(value) : sharedStatus];
}
