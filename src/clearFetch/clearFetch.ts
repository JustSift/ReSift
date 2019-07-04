import createActionType from '../createActionType';
import CLEAR from '../prefixes/CLEAR';
import { FetchActionCreator } from '../defineFetch';
import _get from 'lodash/get';

export type ClearFetchAction = ReturnType<typeof clearFetch>;

type RemoveProps<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>;

export function isClearAction(action: any): action is ClearFetchAction {
  if (typeof action !== 'object') return false;
  if (typeof action.type !== 'string') return false;
  return action.type.startsWith(CLEAR);
}

export default function clearFetch(fetch: FetchActionCreator<any, any, any>) {
  const isActionCreatorFactory = _get(fetch, ['meta', 'type']) === 'ACTION_CREATOR_FACTORY';
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
    meta: fetch.meta as RemoveProps<typeof fetch['meta'], 'key'> & { key: string },
  };
}
