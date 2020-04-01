import DeferredPromise from '../DeferredPromise';
import delay from 'delay';
import createHttpProxy from '../createHttpProxy';

import createHttpService from '../createHttpService';

let server;
const port = 8090;

const mockHandler = jest.fn();

/**
 * @return {Request}
 */
function getRequest() {
  return mockHandler.mock.calls[0][0];
}

beforeEach(() => {
  mockHandler.mockReset();
});

beforeAll(() => {
  // why not test with real superagent?
  const express = require('express');
  const app = express();

  app.get('/', express.json(), (req, res) => {
    mockHandler(req);
    res.sendStatus(200);
  });

  app.post('/', express.json(), (req, res) => {
    mockHandler(req);
    res.sendStatus(200);
  });

  app.get('/never-ending', (req) => {
    mockHandler(req);
  });

  app.get('/bad-request', (req, res) => {
    mockHandler(req);
    res.sendStatus(400);
  });

  app.post('/form', (req, res) => {
    mockHandler(req);
    res.sendStatus(200);
  });

  app.get('/data', (req, res) => {
    mockHandler(req);
    res.json({ mock: 'data' });
  });

  server = app.listen(port);
});

afterAll(() => {
  server.close();
});

test('it throws early with a CanceledError if the request was canceled', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => true,
  });

  // when
  try {
    await http({
      method: 'GET',
      route: '/',
    });
    // then
  } catch (err) {
    expect(err.isCanceledError).toBe(true);
  }

  expect(mockHandler).not.toHaveBeenCalled();
});

test('it allows requests to be canceled', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  let cancelCallback;
  const onCancelCallbackCalled = new DeferredPromise();
  const catchHandler = new DeferredPromise();
  const httpFinishedHandler = jest.fn();

  const http = httpService({
    onCancel: (callback) => {
      expect(typeof callback).toBe('function');
      cancelCallback = callback;
      onCancelCallbackCalled.resolve();
    },
    getCanceled: () => false,
  });

  // when
  http({
    method: 'GET',
    route: '/never-ending',
  })
    .then(httpFinishedHandler)
    .catch((err) => {
      catchHandler.resolve(err);
    });

  await onCancelCallbackCalled;
  expect(typeof cancelCallback).toBe('function');
  cancelCallback();

  // then
  const error = await catchHandler;
  expect(error.isCanceledError).toBe(true);
  expect(httpFinishedHandler).not.toHaveBeenCalled();
});

test('it makes network requests', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  await http({
    method: 'GET',
    route: '/',
  });

  // then
  expect(mockHandler).toHaveBeenCalled();
});

test('it sends the correct headers', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({
      'test-header': 'some value',
    }),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  await http({
    method: 'GET',
    route: '/',
  });

  // then
  expect(getRequest().headers).toHaveProperty('test-header');
  expect(getRequest().headers).toHaveProperty('accept', 'application/json');
});

test('it adds query params', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  await http({
    method: 'GET',
    route: '/',
    query: { please: 'work' },
  });

  // then
  expect(getRequest().query.please).toBe('work');
});

test('it throws when there is a 4xx error', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  try {
    await http({
      method: 'GET',
      route: '/bad-request',
    });
  } catch (e) {
    // then
    expect(e).toMatchInlineSnapshot(`[Error: Bad Request]`);
  }
});

test("it doesn't throw when ok is implemented", async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  await http({
    method: 'GET',
    route: '/bad-request',
    // this makes the 400 response OK
    ok: (response) => response.status === 400,
  });

  // then
  expect(mockHandler).toHaveBeenCalled();
});

test('it sends JSON data', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  const mockPayload = { some: 'data' };

  // when
  await http({
    method: 'POST',
    route: '/',
    data: mockPayload,
  });

  // then
  expect(mockHandler).toHaveBeenCalled();
  const request = getRequest();
  expect(request.body).toEqual(mockPayload);
  expect(request.headers['content-type']).toBe('application/json');
});

test('it receives JSON data', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  const data = await http({
    method: 'GET',
    route: '/data',
  });

  // then
  expect(data).toEqual({ mock: 'data' });
});

test('it gives me access to req', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  const mockReqHandler = jest.fn();

  // when
  await http({
    method: 'GET',
    route: '/data',
    req: mockReqHandler,
  });

  // then
  expect(mockReqHandler).toHaveBeenCalled();
});

test('it gets the prefix from an async function', async () => {
  // given
  const httpService = createHttpService({
    getPrefix: async () => {
      await delay(0);
      return `http://localhost:${port}`;
    },
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  const data = await http({
    method: 'GET',
    route: '/data',
  });

  // then
  expect(data).toEqual({ mock: 'data' });
});

// i think this won't pass because of issues with testing within node
test.todo('it sends form data');

test('proxies as a mock handler', async () => {
  // given
  const exampleObject = { example: 'object' };

  const exampleProxy = createHttpProxy({ path: '/proxy-test' }, (handlerParams) => {
    expect(handlerParams).toMatchInlineSnapshot(`
Object {
  "getCanceled": [Function],
  "headers": Object {},
  "http": [Function],
  "match": Object {
    "isExact": true,
    "params": Object {},
    "path": "/proxy-test",
    "url": "/proxy-test",
  },
  "onCancel": [Function],
  "requestParams": Object {
    "method": "GET",
    "route": "/proxy-test",
  },
}
`);

    return exampleObject;
  });

  const httpService = createHttpService({
    proxies: [exampleProxy],
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  // when
  const data = await http({
    method: 'GET',
    route: '/proxy-test',
  });

  expect(data).toBe(exampleObject);
});

test('proxies with pass through', async () => {
  // given
  let passedThrough = false;

  const exampleProxy = createHttpProxy({ path: '/data' }, ({ http, requestParams }) => {
    passedThrough = true;
    return http(requestParams);
  });

  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    proxies: [exampleProxy],
  });

  const http = httpService({
    onCancel: () => {},
    getCanceled: () => false,
  });

  // when
  const data = await http({
    method: 'GET',
    route: '/data',
  });

  // then
  expect(passedThrough).toBe(true);
  expect(data).toEqual({ mock: 'data' });
});
