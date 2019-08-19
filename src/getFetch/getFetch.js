import { oneLine } from 'common-tags';
import _get from 'lodash/get';
import _flatten from 'lodash/flatten';
import createStoreKey from '../createStoreKey';
import createShareKey from '../createShareKey';

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
function combineSharedStatuses(...statuses) {
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

export function arrayShallowEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    const x = a[i];
    const y = b[i];
    if (x !== y) return false;
  }
  return true;
}

export default function getFetch(fetchActionCreator, state, options) {
  if (!fetchActionCreator) throw new Error('first argument, the fetch action, is required');
  if (!state) throw new Error('state is required');
  if (!state.dataService) {
    throw new Error('"dataService" is a required key. pass in the whole store state.');
  }

  const { fetchFactoryId, displayName, key, share } = fetchActionCreator.meta;
  const storeKey = createStoreKey(displayName, fetchFactoryId);
  if (!key) {
    throw new Error(oneLine`
      Could not find any key for action "${displayName}". If you're using or getting a fetch, ensure
      that you're passing all the correct parameters.
    `);
  }

  const value = _get(state, ['dataService', 'actions', storeKey, key]);

  if (!share) {
    if (!value) return [null, UNKNOWN];

    const data = value.error ? null : value.payload;
    const status = getStatus(value);

    return [data, status];
  }

  const { namespace } = share;
  const shareKey = createShareKey(namespace, key);
  const storeValue = state.dataService.shared[shareKey];
  if (!storeValue) return [null, UNKNOWN];

  const sharedValue = storeValue.data;
  const dataServiceValues = Object.values(storeValue.parentActions).map(
    ({ storeKey, key }) => state.dataService.actions[storeKey][key],
  );
  const sharedStatus = combineSharedStatuses(...dataServiceValues.map(getStatus));

  const isolatedStatus = _get(options, ['isolatedStatus'], false);

  return [sharedValue, isolatedStatus ? getStatus(value) : sharedStatus];
}
