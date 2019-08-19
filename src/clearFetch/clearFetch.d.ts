import { FetchActionCreator } from '../defineFetch';

export type ClearFetchAction = ReturnType<typeof clearFetch>;

export function isClearAction(action: any): action is ClearFetchAction;
export default function clearFetch(fetch: FetchActionCreator): any;
