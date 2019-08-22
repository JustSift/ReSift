import createActionType from '../createActionType';
import CLEAR from '../prefixes/CLEAR';
import _get from 'lodash/get';

export function isClearAction(action) {
  if (typeof action !== 'object') return false;
  if (typeof action.type !== 'string') return false;
  return action.type.startsWith(CLEAR);
}

// TODO: `defineFetch` creates a memoized "fetch factory" against the key given
// to it so the fetches can be compared via value equal (e.g. `===`).
//
// Investigate: this may be a good place to try to clear memoized fetches
export default function clearFetch(fetch) {
  const isActionCreatorFactory = _get(fetch, ['meta', 'type']) === 'FETCH_INSTANCE_FACTORY';
  if (isActionCreatorFactory) {
    throw new Error(
      '[clearFetch] you tried to pass an action creatorFactory to clearFetch. Ask rico until he write docs.',
    );
  }
  if (!fetch.meta.key) {
    throw new Error(
      '`clearFetch` expected to see a key. Are you using a fetch with a dynamic key like a static key?',
    );
  }

  return {
    type: createActionType(CLEAR, fetch.meta),
    meta: fetch.meta,
  };
}
