// TODO: this file should be removed in favor of putting the clearFetch
// action creator inline in useClearFetch
import createActionType from '../createActionType';
import CLEAR from '../prefixes/CLEAR';

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
  const isActionCreatorFactory = fetch?.meta?.type === 'FETCH_INSTANCE_FACTORY';
  if (isActionCreatorFactory) {
    throw new Error(
      '[clearFetch] you tried to pass an action creatorFactory to clearFetch. Ask rico until he write docs.',
    );
  }

  return {
    type: createActionType(CLEAR, fetch.meta),
    meta: fetch.meta,
  };
}
