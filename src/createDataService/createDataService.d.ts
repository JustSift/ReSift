import { FetchActionMeta } from '../defineFetch';

/**
 * @docs `createDataService`
 *
 * Creates the data service to be feed into the `<ResiftProvider dataService={dataService} />` or in
 * [Redux middleware](../guides/usage-with-redux.md).
 */
export default function createDataService(params: DataServiceParams): any;

/**
 * @docs `DataServiceParams`
 *
 * You must provide an object with the following shape into `createDataService`.
 * See [Writing fetch services](../guides/writing-fetch-services.md) for more info.
 */
export interface DataServiceParams {
  /**
   * Defines the shape of the data services object you can destructure in the request body of a
   * fetch factory.
   * [See here for more info.](../main-concepts/how-to-define-a-fetch#what-are-data-service-arguments)
   */
  services: { [key: string]: FetchService<any> };
  /**
   * This callback fires when any promise `throw`s or `catch`es with an error from a fetch service.
   * If you're unsure how to handle this error, re-throw:
   * `onError: e => { throw e; }`
   */
  onError: (error: Error) => void;
}

/**
 * @docs `FetchService`
 *
 * A fetch service is a function that returns data asynchronously. This data is given to ReSift for
 * storage and retrieval.
 *
 * See [`createHttpService`](https://github.com/JustSift/ReSift/blob/master/src/createHttpService/createHttpService.js)
 * for a reference implementation of a fetch service.
 */
export type FetchService<T> = {
  (params: FetchServiceParams): T | Promise<T | undefined>;
};

/**
 * @docs `FetchServiceParams`
 *
 * The data service provides fetches services with this object. Fetch services are expected to use
 * these params to implement cancellation correctly.
 */
export interface FetchServiceParams {
  /**
   * Adds a callback listener to the cancellation mechanism. If the request is cancelled, the
   * callback given will be invoked.
   *
   * See [`createHttpService`](https://github.com/JustSift/ReSift/blob/master/src/createHttpService/createHttpService.js)
   * for a reference implementation
   */
  onCancel: (callback: () => void) => void;
  /**
   * Returns whether or not the request has been cancelled. Use this in conjunction with
   * [CanceledError](./canceled-error.md) to early exit when a cancellation occurs.
   *
   * See [`createHttpService`](https://github.com/JustSift/ReSift/blob/master/src/createHttpService/createHttpService.js)
   * for a reference implementation
   */
  getCanceled: () => boolean;
}

export function isSuccessAction(action: any): action is SuccessAction;

export function isErrorAction(action: any): action is SuccessAction;

export interface SuccessAction {
  /**
   * `@@RESIFT/SUCCESS`
   */
  type: string;
  /**
   * An object containing some information about this action. This comes from `defineFetch.js`
   */
  meta: FetchActionMeta;
  payload: any;
}

export interface ErrorAction {
  /**
   * `@@RESIFT/ERROR`
   */
  type: string;
  /**
   * An object containing some information about this action. This comes from `defineFetch.js`
   */
  meta: FetchActionMeta;
  /**
   * The error
   */
  payload: Error;
  error: true;
}

export type ServicesFrom<ServicesObject extends { [key: string]: (...args: any[]) => any }> = {
  [P in keyof ServicesObject]: ReturnType<ServicesObject[P]>;
};
