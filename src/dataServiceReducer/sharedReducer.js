import _get from 'lodash/get';
import { isFetchAction } from '../defineFetch';
import { isSuccessAction } from '../createDataService';
import { isClearAction } from '../clearFetch';

const initialState = {
  data: {},
  parents: {},
  merges: {},
};

// for each fetch factory, save their normalized merge object into an easy-to-look-up place
// on success, find the merge functions relevant to the current merge

export default function sharedReducer(state = initialState, action) {
  if (isFetchAction(action)) {
    const { meta } = action;
    const { displayName, fetchFactoryId, key, share } = meta;
    // only run this reducer if this action is `share`d
    if (!share) return state;

    const { namespace, mergeObj } = share;

    const mergeState = { ..._get(state, ['merges']) };
    // (eslint bug)
    // eslint-disable-next-line no-unused-vars
    for (const [targetNamespace, mergeFn] of Object.entries(mergeObj)) {
      const merges = { ..._get(mergeState, [targetNamespace]) };
      merges[namespace] = mergeFn;

      mergeState[targetNamespace] = merges;
    }

    const parentsState = { ..._get(state, ['parents']) };

    // (eslint bug)
    // eslint-disable-next-line no-unused-vars
    const parents = { ..._get(parentsState, [namespace]) };
    parents[`${displayName} | ${key} | ${fetchFactoryId}`] = {
      fetchFactoryId,
      key,
      displayName,
    };

    parentsState[namespace] = parents;

    return {
      ...state,
      merges: mergeState,
      parents: parentsState,
    };
  }

  if (isSuccessAction(action)) {
    const { meta, payload } = action;
    const { key, share } = meta;

    // only run this reducer if this action is `share`d
    if (!share) return state;
    const { namespace } = share;

    const merges = _get(state, ['merges', namespace]);

    const nextData = { ..._get(state, ['data']) };

    // (eslint bug)
    // eslint-disable-next-line no-unused-vars
    for (const [targetNamespace, mergeFn] of Object.entries(merges)) {
      // if the target namespace is the same from the action's namespace
      // we should only apply the merge function over the current key
      if (targetNamespace === namespace) {
        nextData[targetNamespace] = {
          ..._get(state.data, [targetNamespace]),
          [key]: mergeFn(_get(state.data, [targetNamespace, key]), payload),
        };
        continue;
      }

      const mergedData = Object.entries(_get(state, ['data', targetNamespace], {})).reduce(
        (acc, [key, value]) => {
          acc[key] = mergeFn(value, payload);
          return acc;
        },
        {},
      );

      // otherwise we should apply the merge function over all the keys
      nextData[targetNamespace] = mergedData;
    }

    return {
      ...state,
      data: nextData,
    };
  }

  if (isClearAction(action)) {
    const { meta } = action;
    const { displayName, fetchFactoryId, key, share } = meta;
    // only run this reducer if this action is `share`d
    if (!share) return state;

    const { namespace, mergeObj } = share;

    const mergeState = { ..._get(state, ['merges']) };
    // (eslint bug)
    // eslint-disable-next-line no-unused-vars
    for (const [targetNamespace, mergeFn] of Object.entries(mergeObj)) {
      const merges = { ..._get(mergeState, [targetNamespace]) };
      delete merges[namespace];

      mergeState[targetNamespace] = merges;
    }

    const parentsState = { ..._get(state, ['parents']) };

    // (eslint bug)
    // eslint-disable-next-line no-unused-vars
    const parents = { ..._get(parentsState, [namespace]) };
    delete parents[`${displayName} | ${key} | ${fetchFactoryId}`];

    parentsState[namespace] = parents;

    return {
      ...state,
      merges: mergeState,
      parents: parentsState,
    };
  }

  return state;
}
