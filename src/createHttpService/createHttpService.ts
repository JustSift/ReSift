import request from 'superagent';
import { DataServiceParams } from '../createDataServiceMiddleware';
import CancelledError from '../CancelledError';

export interface HttpServiceParams {
  getHeaders: (() => any) | (() => Promise<any>);
  prefix?: string;
  getPrefix?: (() => string) | (() => Promise<string>);
}

export interface HttpParams {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  route: string;
  query?: { [key: string]: string };
  data?: any;
  /**
   * http://visionmedia.github.io/superagent/#error-handling
   *
   * > Alternatively, you can use the `.ok(callback)` method to decide whether a response is an
   * > error or not. The callback to the `ok` function gets a response and returns `true` if the
   * > response should be interpreted as success.
   * 
   * ```js
    request.get('/404')
      .ok(res => res.status < 500)
      .then(response => {
        // reads 404 page as a successful response
      });
  ```
   */
  ok?: (response: request.Response) => boolean;
  /**
   * you can add custom behavior to the superagent req using this callback.
   * it is added before the `req.send` method is called
   */
  req?: (request: request.SuperAgentRequest) => void;
}

async function getPrefix(
  _prefix: string | undefined,
  _getPrefix: (() => string) | (() => Promise<string>) | undefined,
) {
  if (_prefix) {
    return _prefix;
  }

  if (typeof _getPrefix === 'function') {
    return await _getPrefix();
  }

  return '';
}

export default function createHttpService({
  prefix: _prefix,
  getHeaders,
  getPrefix: _getPrefix,
}: HttpServiceParams) {
  return ({ onCancel, getCancelled }: DataServiceParams) => async ({
    method,
    route,
    query,
    data,
    ok,
    req: reqHandler,
  }: HttpParams) => {
    try {
      if (getCancelled()) {
        throw new CancelledError();
      }

      const normalizedMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch';

      const headers = await getHeaders();
      const prefix = await getPrefix(_prefix, _getPrefix);

      const req = request[normalizedMethod](`${prefix}${route}`).accept('application/json');

      const headerEntries = Object.entries(headers) as any;

      for (const [headerKey, headerValue] of headerEntries) {
        req.set(headerKey, headerValue);
      }

      onCancel(() => {
        req.abort();
      });

      if (query) {
        req.query(query);
      }

      if (ok) {
        req.ok(ok);
      }

      if (reqHandler) {
        reqHandler(req);
      }

      if (data) {
        req.send(data);
      }

      const payload = await req;

      return payload.body;
    } catch (e) {
      // replace the error if the request was aborted
      // https://github.com/visionmedia/superagent/blob/f3ac20cc7c6497c002a94f5930cf2603ec7c9c6c/lib/request-base.js#L248
      if (e.code === 'ABORTED') throw new CancelledError();
      throw e;
    }
  };
}
