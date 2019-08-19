import request from 'superagent';
import CanceledError from '../CanceledError';
import matchPath from '../createHttpProxy/matchPath';

async function getPrefix(_prefix, _getPrefix) {
  if (_prefix) {
    return _prefix;
  }

  if (typeof _getPrefix === 'function') {
    const prefix = await _getPrefix();
    return prefix;
  }

  return '';
}

async function http(
  { method, query, route, ok, req: reqHandler, data },
  { headers, onCancel, prefix },
) {
  /** @type {'get' | 'post' | 'put' | 'delete' | 'patch'} */
  const normalizedMethod = method.toLowerCase();
  const path = `${prefix}${route}`;

  const req = request[normalizedMethod](path).accept('application/json');

  const headerEntries = Object.entries(headers);

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
}

export default function createHttpService({
  prefix: _prefix,
  getHeaders = () => ({}),
  getPrefix: _getPrefix,
  proxies = [],
}) {
  return ({ onCancel, getCanceled }) => async requestParams => {
    const { route } = requestParams;

    try {
      if (getCanceled()) {
        throw new CanceledError();
      }

      const headers = await getHeaders();
      const prefix = await getPrefix(_prefix, _getPrefix);

      const httpOptions = { headers, prefix, onCancel };

      const proxy = proxies.find(proxy => matchPath(route, proxy.matchParams));

      if (proxy) {
        const match = matchPath(route, proxy.matchParams);
        return proxy.handler({
          match,
          requestParams,
          headers,
          onCancel,
          getCanceled,
          http: requestParams => http(requestParams, httpOptions),
        });
      }

      // await is needed to bubble promise rejection so the catch block below this works correctly
      const data = await http(requestParams, httpOptions);
      return data;
    } catch (e) {
      /*
       * replace the error if the request was aborted
       * https://github.com/visionmedia/superagent/blob/f3ac20cc7c6497c002a94f5930cf2603ec7c9c6c/lib/request-base.js#L248
       */
      if (e.code === 'ABORTED') throw new CanceledError();
      throw e;
    }
  };
}
