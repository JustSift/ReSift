import { FetchActionCreator, FetchActionMeta } from '../defineFetch';

export interface ClearFetchAction {
  type: string;
  meta: FetchActionMeta;
}
export function isClearAction(action: any): action is ClearFetchAction;
export default function clearFetch(fetch: FetchActionCreator): ClearFetchAction;
