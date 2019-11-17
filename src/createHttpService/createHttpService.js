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

function safeParseJson(maybeJson) {
  try {
    return JSON.parse(maybeJson);
  } catch {
    return null;
  }
}

// copied from:
// https://github.com/visionmedia/superagent/blob/483f8166f42a78c47c8116f3cfca7a7bd308d66c/src/client.js#L243
function parseHeader(str) {
  const lines = str.split(/\r?\n/);
  const fields = {};
  let index;
  let line;
  let field;
  let val;

  for (let i = 0, len = lines.length; i < len; ++i) {
    line = lines[i];
    index = line.indexOf(':');
    if (index === -1) {
      // could be empty line, just skip it
      continue;
    }

    field = line
      .slice(0, index)
      .toLowerCase()
      .trim();
    val = line.trim().slice(index + 1);
    fields[field] = val;
  }

  return fields;
}

async function http(
  {
    method,
    query,
    route,
    ok = xhr => xhr.status >= 200 && xhr.status < 300,
    req: reqHandler,
    data,
  },
  { headers, onCancel, prefix },
) {
  /** @type {'get' | 'post' | 'put' | 'delete' | 'patch'} */
  const normalizedMethod = method.toLowerCase();
  const queryString = Object.entries(query || {})
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(v => ({ key, value: v }));
      }
      return [{ key, value }];
    })
    .reduce((flattened, next) => {
      // eslint-disable-next-line no-unused-vars
      for (const tuple of next) {
        flattened.push(tuple);
      }
      return flattened;
    }, [])
    .map(({ key, value }) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');

  const path = `${prefix}${route}${queryString && `?${queryString}`}`;

  const xhr = new XMLHttpRequest();
  xhr.open(normalizedMethod, path, true);

  xhr.setRequestHeader('Accept', 'application/json');
  const headerEntries = Object.entries(headers || {});
  // https://github.com/eslint/eslint/issues/12117
  // eslint-disable-next-line no-unused-vars
  for (const [headerKey, headerValue] of headerEntries) {
    xhr.setRequestHeader(headerKey, headerValue);
  }

  if (data) {
    xhr.setRequestHeader('Content-Type', 'application/json')
  }

  onCancel(() => {
    xhr.abort();
  });

  if (reqHandler) {
    reqHandler(xhr);
  }

  xhr.send(data ? JSON.stringify(data) : undefined);

  const payload = await new Promise((resolve, reject) => {
    xhr.addEventListener('loadend', () => {
      if (xhr.status === 0) {
        reject(new CanceledError());
      }

      const isOk = ok(xhr);
      if (isOk) {
        try {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            resolve(null);
          }
        } catch {
          reject(new Error('[createHttpService] Failed to parse JSON from responseText'));
        }
      } else {
        const error = new Error('[createHttpService] Non-OK HTTP Response');
        error.status = xhr.status;
        const headers = parseHeader(xhr.getAllResponseHeaders());
        error.response = {
          text: xhr.responseText,
          body: safeParseJson(xhr.responseText),
          header: headers,
          type: headers['content-type'],
        };
        reject(error);
      }
    });
  });

  return payload;
}

export default function createHttpService({
  prefix: _prefix,
  getHeaders = () => ({}),
  getPrefix: _getPrefix,
  proxies = [],
}) {
  return ({ onCancel, getCanceled }) => async requestParams => {
    const { route } = requestParams;
    if (process.env.NODE_ENV !== 'production') {
      if (route.includes('?')) {
        console.warn(
          `[createHttpService] You included a \`?\` in your route "${route}". We recommend using \`query\` instead. https://resift.org/docs/api/create-http-service#httpparams`,
        );
      }
    }

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
