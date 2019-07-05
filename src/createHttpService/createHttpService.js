import request from 'superagent';
import CancelledError from '../CancelledError';

async function getPrefix(_prefix, _getPrefix) {
  if (_prefix) {
    return _prefix;
  }

  if (typeof _getPrefix === 'function') {
    return await _getPrefix();
  }

  return '';
}

export default function createHttpService({ prefix: _prefix, getHeaders, getPrefix: _getPrefix }) {
  return ({ onCancel, getCancelled }) => async ({
    method,
    route,
    query,
    data,
    ok,
    req: reqHandler,
  }) => {
    try {
      if (getCancelled()) {
        throw new CancelledError();
      }

      const normalizedMethod = method.toLowerCase();

      const headers = await getHeaders();
      const prefix = await getPrefix(_prefix, _getPrefix);

      const req = request[normalizedMethod](`${prefix}${route}`).accept('application/json');

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
    } catch (e) {
      // replace the error if the request was aborted
      // https://github.com/visionmedia/superagent/blob/f3ac20cc7c6497c002a94f5930cf2603ec7c9c6c/lib/request-base.js#L248
      if (e.code === 'ABORTED') throw new CancelledError();
      throw e;
    }
  };
}
