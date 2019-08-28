import { MatchParams, Match } from './matchPath';
import { HttpParams } from '../createHttpService';

/**
 * @docs `createHttpProxy`
 * Creates an HTTP Proxy that can be used to intercept requests made with the HTTP service.
 *
 * [See this doc for more info.](../guides/http-proxies.md)
 */
export default function createHttpProxy(
  // This takes in the same parameters as `matchPath` or `<Route />` from `react-router`
  // [See `react-router`'s docs for more info.](https://reacttraining.com/react-router/web/api/matchPath)
  matchParams: string | string[] | MatchParams,

  // ReSift will provide `params` below. Destructure it to get the desired props.
  handler: (params: HttpProxyParams) => any,
): HttpProxy;

/**
 * @docs `HttpProxyParams`
 * @omitRequired
 *
 * The params to the handler of an HTTP proxy.
 */
interface HttpProxyParams {
  /**
   * The match object from `matchPath` from `react-router`.
   *
   * [See `react-router`'s docs for more info.](https://reacttraining.com/react-router/web/api/match)
   */
  match: Match;
  /**
   * The `http` function that `createHttpService` creates. This is the same `http` you destructure
   * to use the HTTP service.
   */
  http: (requestParams: HttpParams) => Promise<any>;
  /**
   * The parameters passed into the `http` call from the original request.
   */
  requestParams: HttpParams;
  /**
   * Any headers that were passed through from `getHeaders` in `createHttpService`
   */
  headers: any;
  /**
   * The `prefix` passed into `createHttpService`.
   */
  prefix: string;
  /**
   * The cancellation mechanism from the HTTP service.
   */
  onCancel: (subscriber: () => void) => void;
  /**
   * The cancellation mechanism from the HTTP service.
   */
  getCanceled: () => boolean;
}

export interface HttpProxy {
  matchParams: string | string[] | MatchParams;
  handler: (params: HttpProxyParams) => any;
}
