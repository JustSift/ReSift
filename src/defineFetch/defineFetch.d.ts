export default function defineFetch<
  KeyArgs extends any[],
  FetchArgs extends any[],
  FetchResult,
  MergeResult
>(
  params: DefineFetchParams<KeyArgs, FetchArgs, FetchResult, MergeResult>,
): FetchActionFactory<KeyArgs, FetchArgs, FetchResult, MergeResult>;

/**
 * the shape of the parameter object that goes into `defineFetch`
 */
export interface DefineFetchParams<
  KeyArgs extends any[],
  FetchArgs extends any[],
  FetchResult,
  MergeResult
> {
  displayName: string;
  make: (
    ...keyArgs: KeyArgs
  ) => { key: string[]; request: (...fetchArgs: FetchArgs) => (services: any) => FetchResult };
  share?: ShareParams<MergeResult>;
  conflict?: 'cancel' | 'ignore';
  staticFetchFactoryId?: string;
}

export interface ShareParams<MergeResult> {
  namespace: string;
  merge?: (previous: any, next: any) => MergeResult;
}

/**
 * the result of calling `defineFetch` is a factory that returns an action creator with meta data
 */
export interface FetchActionFactory<
  KeyArgs extends any[],
  FetchArgs extends any[],
  FetchResult,
  MergeResult
> {
  (...args: KeyArgs): FetchActionCreator<FetchArgs, FetchResult, MergeResult>;

  meta: {
    fetchFactoryId: string;
    displayName: string;
  };
}

export interface FetchActionCreator<
  FetchArgs extends any[] = any,
  FetchResult = any,
  MergeResult = any
> {
  (...args: FetchArgs): FetchAction;

  meta: FetchActionMeta;
}

export interface FetchAction {
  type: string;
  meta: FetchActionMeta;
  payload: FetchActionPayload;
}

export interface FetchActionPayload<T = any> {
  (services: any): T | Promise<T>;

  cancel: () => void;
  getCanceled: () => boolean;
  onCancel: (callback: () => void) => void;
}

export interface FetchActionMeta {
  fetchFactoryId: string;
  key: string;
  displayName: string;
  share?: ShareParams<any>;
  conflict: 'cancel' | 'ignore';
}

export function isFetchAction(action: any): action is FetchAction;
