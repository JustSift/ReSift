import request from 'superagent';
import { FetchServiceParams } from '../createDataService';
import { HttpProxy } from '../createHttpProxy';

/**
 * @docs `HttpParams`
 *
 * If you're looking for the params for the `http` calls inside a fetch factory's request, you've
 * found 'em!
 *
 * e.g.
 * ```js
 * const makePersonFetch = defineFetch({
 *   displayName: 'Get Person',
 *   make: personId => ({
 *     key: [personId],
 *     request: () => ({ http }) => http({
 *       // see below for what can go here
 *       // 👇👇👇👇👇
 *     }),
 *   })
 * });
 * ```
 *
 * The HTTP Service uses [superagent](https://visionmedia.github.io/superagent/) behind the scenes.
 */
export interface HttpParams {
  /**
   * The HTTP method to use.
   */
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  /**
   * The route to use.
   */
  route: string;
  /**
   * An object representing the query parameters to serialize to the URL.
   *
   * `{foo: ['bar', 'baz'], hello: 'world'}` `==>` `?foo=bar&foo=baz&hello=world`
   */
  query?: { [key: string]: string };
  /**
   * The data to be sent to the URL. If this is an object, it will be serialized to JSON. Sending
   * a `FormData` object is also supported.
   */
  data?: any;
  /**
   * This is directly upstream's `.ok` method:
   *
   * http://visionmedia.github.io/superagent/#error-handling
   *
   * "Alternatively, you can use the `.ok(callback)` method to decide whether a response is an
   * error or not. The callback to the `ok` function gets a response and returns `true` if the
   * response should be interpreted as success."
   */
  ok?: (response: request.Response) => boolean;
  /**
   * You can add custom behavior to the superagent `req` using this callback.
   * it is added before the `req.send` method is called
   */
  req?: (request: request.SuperAgentRequest) => void;
}

/**
 * @docs `createHttpService`
 *
 * Give the required `HttpServiceParams`, this function returns an HTTP service ready to be put into
 * the `services` object in [`createDataService`](./create-data-service.md).
 */
export default function createHttpService(params: HttpServiceParams): HttpService;

type HttpService = (dsParams: FetchServiceParams) => (requestParams: HttpParams) => Promise<any>;

/**
 * @docs `HttpServiceParams`
 *
 * The params that can be passed into the `createHttpService` function.
 */
export interface HttpServiceParams {
  /**
   * Provide a function to the HTTP service to return headers for the request. Use this to inject
   * any authentication tokens.
   */
  getHeaders?: (() => any) | (() => Promise<any>);
  /**
   * Use this to prefix all requests with a certain path. e.g. `/api`
   */
  prefix?: string;
  /**
   * Use this to dynamically determine the prefix.
   */
  getPrefix?: (() => string) | (() => Promise<string>);
  /**
   * Pass any proxies into the HTTP service here. Create the proxy with
   * [`createHttpProxy`](./create-http-proxy.md) first.
   */
  proxies?: HttpProxy[];
}
