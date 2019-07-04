import _noop from 'lodash/noop';
import DeferredPromise from '../DeferredPromise';
import timer from '../timer';

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

  app.get('/never-ending', req => {
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

test('it throws early with a CancelledError if the request was canceled', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: () => {},
    getCancelled: () => true,
  });

  // when
  try {
    await http({
      method: 'GET',
      route: '/',
    });
    // then
  } catch (err) {
    expect(err.isCancelledError).toBe(true);
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
    onCancel: callback => {
      expect(typeof callback).toBe('function');
      cancelCallback = callback;
      onCancelCallbackCalled.resolve();
    },
    getCancelled: () => false,
  });

  // when
  http({
    method: 'GET',
    route: '/never-ending',
  })
    .then(httpFinishedHandler)
    .catch(err => {
      catchHandler.resolve(err);
    });

  await onCancelCallbackCalled;
  expect(typeof cancelCallback).toBe('function');
  cancelCallback();

  // then
  const error = await catchHandler;
  expect(error.isCancelledError).toBe(true);
  expect(httpFinishedHandler).not.toHaveBeenCalled();
});

test('it makes network requests', async () => {
  // given
  const httpService = createHttpService({
    prefix: `http://localhost:${port}`,
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: _noop,
    getCancelled: () => false,
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
    onCancel: _noop,
    getCancelled: () => false,
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
    onCancel: _noop,
    getCancelled: () => false,
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
    onCancel: _noop,
    getCancelled: () => false,
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
    onCancel: _noop,
    getCancelled: () => false,
  });

  expect(mockHandler).not.toHaveBeenCalled();

  // when
  await http({
    method: 'GET',
    route: '/bad-request',
    // this makes the 400 response OK
    ok: response => response.status === 400,
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
    onCancel: _noop,
    getCancelled: () => false,
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
    onCancel: _noop,
    getCancelled: () => false,
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
    onCancel: _noop,
    getCancelled: () => false,
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
      await timer(0);
      return `http://localhost:${port}`;
    },
    getHeaders: () => ({}),
  });

  const http = httpService({
    onCancel: _noop,
    getCancelled: () => false,
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
