/**
 * @docs `defineFetch`
 * This function creates a fetch factory. See [How to define a fetch](../main-concepts/how-to-define-a-fetch.md) to learn more
 */
export default function defineFetch<KeyArgs extends any[], FetchArgs extends any[]>(
  params: DefineFetchParams<KeyArgs, FetchArgs>,
): FetchFactory<KeyArgs, FetchArgs>;

/**
 * @docs `DefineFetchParams`
 * the shape of the parameter object that goes into `defineFetch`
 */
export interface DefineFetchParams<KeyArgs extends any[], FetchArgs extends any[]> {
  /**
   * The display name should be a human readable string to help you debug.
   */
  displayName: string;

  /**
   * The make function defines two things:
   *
   * - how your fetch factory will make fetch instances and
   * - how your fetch instances will get their data.
   *
   * See [How to define a fetch](../main-concepts/how-to-define-a-fetch.md) for more info.
   */
  make: (...keyArgs: KeyArgs) => MakeObject<FetchArgs>;

  /**
   * If `share` is present, this fetch factory can have its state shared.
   */
  share?: ShareParams;

  /**
   * This determines the conflict resolution of ReSift. When two of the same
   * fetches are inflight, one of the fetches needs to be discard. If the
   * conflict resolution is set to `cancel`, the older request will be
   * canceled. If the conflict resolution is set to `ignore`, the newer request
   * will be ignored in favor of the older request.
   *
   * The default is `cancel`
   */
  conflict?: 'cancel' | 'ignore';

  /**
   * On creation, fetch factories keep an internal random ID. If you're trying
   * to re-hydrate this state and would like your fetch factories to resolve to
   * the same ID instead of a random ID, you can set this property.
   */
  staticFetchFactoryId?: string;
}

/**
 * @docs `MakeObject`
 * When defining the `make` function in `defineFetch`, you must return this object.
 */
interface MakeObject<FetchArgs extends any[]> {
  request: (...fetchArgs: FetchArgs) => (services: any) => any;
}

/**
 * @docs `ShareParams`
 */
export interface ShareParams {
  /**
   * This namespace represents the group you want this fetch factory to be in.
   * If you are doing CRUD operations to the same resource on the back-end, then
   * you probably want to use the same namespace.
   *
   * See [Making state consistent](../main-concepts/making-state-consistent.md)
   * for more info.
   */
  namespace: string;

  /**
   * [See here for more info.](../main-concepts/making-state-consistent.md#merges-across-namespaces)
   */
  merge?:
    | ((previous: any, next: any) => any)
    | { [key: string]: (previous: any, next: any) => any };
}

/**
 * @docs `FetchActionFactory`
 * the result of calling `defineFetch` is a factory that returns an action creator with meta data
 */
export type FetchFactory<KeyArgs extends any[], FetchArgs extends any[], Data = any> = (
  ...args: KeyArgs
) => FetchInstance<FetchArgs, Data>;

export interface FetchInstance<FetchArgs extends any[] = any, Data = any> {
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
  share?: ShareParams;
  conflict: 'cancel' | 'ignore';
}

export function isFetchAction(action: any): action is FetchAction;

/**
 * @docs `typedFetchFactory`
 *
 * A helper used to allow you to set the type of data your fetch factory will
 * return.
 *
 * See [Usage with typescript](../guides/usage-with-typescript.md) for more info.
 */
export function typedFetchFactory<Data>(): <KeyArgs extends any[], FetchArgs extends any[]>(
  fetchFactory: FetchFactory<KeyArgs, FetchArgs>,
) => FetchFactory<KeyArgs, FetchArgs, Data>;
