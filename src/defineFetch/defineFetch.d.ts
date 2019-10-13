/**
 * @docs `defineFetch`
 * This function create a fetch factory.
 */
export default function defineFetch<
  KeyArgs extends any[],
  FetchArgs extends any[],
  FetchResult,
  MergeResult
>(
  params: DefineFetchParams<KeyArgs, FetchArgs, FetchResult, MergeResult>,
): FetchActionFactory<KeyArgs, FetchArgs, FetchResult, MergeResult>;

/**
 * @docs `DefineFetchParams`
 * the shape of the parameter object that goes into `defineFetch`
 */
export interface DefineFetchParams<
  KeyArgs extends any[],
  FetchArgs extends any[],
  FetchResult,
  MergeResult
> {
  /**
   * this is a display name
   */
  displayName: string;

  /**
   * this is make.
   */
  make: (...keyArgs: KeyArgs) => MakeObject<FetchArgs, FetchResult>;

  share?: ShareParams<MergeResult>;
  conflict?: 'cancel' | 'ignore';
  staticFetchFactoryId?: string;
}

/**
 * @docs `MakeObject`
 * When defining the `make` function in `defineFetch`, you must return this object.
 */
interface MakeObject<FetchArgs extends any[], FetchResult> {
  request: (...fetchArgs: FetchArgs) => (services: any) => FetchResult;
}

/**
 * @docs `ShareParams`
 */
export interface ShareParams<MergeResult> {
  namespace: string;
  merge?: (previous: any, next: any) => MergeResult;
}

/**
 * @docs `FetchActionFactory`
 * the result of calling `defineFetch` is a factory that returns an action creator with meta data
 */
export type FetchActionFactory<
  KeyArgs extends any[],
  FetchArgs extends any[],
  FetchResult,
  MergeResult
> = (
  ...args: KeyArgs
) => FetchActionCreator<FetchArgs, FetchResult, MergeResult> & {
  meta: {
    fetchFactoryId: string;
    displayName: string;
  };
};

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
