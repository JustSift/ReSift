import SUCCESS from '../prefixes/SUCCESS';
import ERROR from '../prefixes/ERROR';
import timer from '../timer';
import DeferredPromise from '../DeferredPromise';
import defineFetch from '../defineFetch';
import _noop from 'lodash/noop';
import dataServiceReducer from '../dataServiceReducer';
import createActionType from '../createActionType';
import CanceledError from '../CanceledError';

import createDataServiceMiddleware, {
  handleAction,
  isSuccessAction,
  isErrorAction,
} from './createDataServiceMiddleware';

jest.mock('shortid', () => () => 'test-short-id');
jest.mock('../timestamp', () => () => 'test-timestamp');

describe('middleware', () => {
  test('throws if no `services` key', () => {
    expect(() => {
      createDataServiceMiddleware({ services: undefined, onError: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`"\`services\` key required"`);
  });

  test('throws if no `onError` key', () => {
    expect(() => {
      createDataServiceMiddleware({ services: {}, onError: undefined });
    }).toThrowErrorMatchingInlineSnapshot(`"\`onError\` callback required"`);
  });

  test('it returns a middleware that will call the next action if the action is not a fetch', () => {
    // given
    const mockErrorHandler = jest.fn();
    const middleware = createDataServiceMiddleware({ services: {}, onError: mockErrorHandler });

    const mockStore = {};
    const mockNext = jest.fn();
    const mockAction = { type: 'MOCK_TYPE' };

    // when
    middleware(mockStore)(mockNext)(mockAction);

    // then
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(mockAction);
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  test('it synchronously calls next action after running it through `handleAction`', async () => {
    // given
    const mockErrorHandler = jest.fn();
    const middleware = createDataServiceMiddleware({ services: {}, onError: mockErrorHandler });

    const mockStore = {
      getState: () => ({}),
    };
    const mockNext = jest.fn();

    const fetchFactory = defineFetch({
      displayName: 'example fetch',
      make: () => ({
        key: [],
        request: () => () => {},
      }),
    });

    const mockAction = fetchFactory();

    // when
    await middleware(mockStore)(mockNext)(mockAction);

    // then
    expect(mockNext).toHaveBeenCalledTimes(1);
    expect(mockNext).toHaveBeenCalledWith(mockAction);
    expect(mockErrorHandler).not.toHaveBeenCalled();
  });

  test('it asynchronously dispatches a SUCCESS', async () => {
    // given
    const mockErrorHandler = jest.fn();
    const middleware = createDataServiceMiddleware({
      services: { testService: ({ onCancel }) => () => timer(0) },
      onError: mockErrorHandler,
    });
    const mockNext = jest.fn();

    const dispatchCalled = new DeferredPromise();

    const mockStore = {
      getState: () => ({}),
      dispatch: action => {
        dispatchCalled.resolve(action);
      },
    };

    const makeFetch = defineFetch({
      displayName: 'example fetch',
      make: testArg => ({
        key: [testArg],
        request: () => ({ testService }) => testService(testArg),
      }),
    });
    const fetch = makeFetch('test-arg');
    const action = fetch();

    expect(action).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "example fetch",
    "fetchFactoryId": "test-short-id",
    "key": "key:test-arg",
    "share": undefined,
  },
  "payload": [Function],
  "type": "@@RESIFT/FETCH | example fetch | test-short-id",
}
`);

    // when
    middleware(mockStore)(mockNext)(action);

    // then
    const successAction = await dispatchCalled;
    expect(successAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "example fetch",
    "fetchFactoryId": "test-short-id",
    "key": "key:test-arg",
    "share": undefined,
  },
  "payload": "TIMER",
  "type": "@@RESIFT/SUCCESS | example fetch | test-short-id",
}
`);
  });

  test('it asynchronously dispatches an ERROR if the payload fails and calls onError', async () => {
    // given
    const mockErrorHandler = jest.fn();
    const middleware = createDataServiceMiddleware({ services: {}, onError: mockErrorHandler });
    const mockNext = jest.fn();

    const dispatchCalled = new DeferredPromise();

    const mockStore = {
      getState: () => ({}),
      dispatch: action => {
        dispatchCalled.resolve(action);
      },
    };

    const testError = new Error('test error');

    const makeActionCreator = defineFetch({
      displayName: 'example fetch',
      make: testArg => ({
        key: [testArg],
        request: () => async ({ testService }) => {
          await timer(0);
          throw testError;
        },
      }),
    });
    const actionCreator = makeActionCreator('test-arg');
    const action = actionCreator();

    // when
    try {
      await middleware(mockStore)(mockNext)(action);
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`[Error: test error]`);
    }

    // then
    const errorAction = await dispatchCalled;
    expect(errorAction.payload).toBe(testError);
    expect(mockErrorHandler).toHaveBeenCalledWith(testError);
    expect(errorAction).toMatchInlineSnapshot(`
Object {
  "error": true,
  "meta": Object {
    "conflict": "cancel",
    "displayName": "example fetch",
    "fetchFactoryId": "test-short-id",
    "key": "key:test-arg",
    "share": undefined,
  },
  "payload": [Error: test error],
  "type": "@@RESIFT/ERROR | example fetch | test-short-id",
}
`);
  });
});

describe('handleAction', () => {
  test('it injects each service with `getCanceled` and `onCanceled`', async () => {
    // given
    const exampleServiceCalled = new DeferredPromise();
    const makeActionCreator = defineFetch({
      displayName: 'test action',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(),
      }),
    });
    const actionCreator = makeActionCreator('test-arg');

    const exampleService = ({ onCancel, getCanceled }) => () => {
      // then
      expect(typeof onCancel).toBe('function');
      expect(typeof getCanceled).toBe('function');
      exampleServiceCalled.resolve();
    };

    const action = actionCreator();
    expect(action).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "test action",
    "fetchFactoryId": "test-short-id",
    "key": "key:test-arg",
    "share": undefined,
  },
  "payload": [Function],
  "type": "@@RESIFT/FETCH | test action | test-short-id",
}
`);

    // when
    await handleAction({
      state: {},
      services: { exampleService },
      dispatch: _noop,
      action: actionCreator('test arg'),
    });

    await exampleServiceCalled;
  });

  test('it injects the dispatch service', () => {
    // given
    const mockDispatch = jest.fn();

    const makeActionCreator = defineFetch({
      displayName: 'test dispatch service',
      make: () => ({
        key: [],
        request: () => ({ dispatch }) => {
          dispatch({ type: 'TEST_TYPE' });
          return null;
        },
      }),
    });
    const actionCreator = makeActionCreator();

    // when
    handleAction({
      state: {},
      services: {},
      dispatch: mockDispatch,
      action: actionCreator(),
    });

    expect(mockDispatch).toHaveBeenCalled();
  });

  test('conflict ignore', async () => {
    const makeActionCreator = defineFetch({
      displayName: 'action creator',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
      conflict: 'ignore',
    });
    const testArg = 'test arg';
    const actionCreator = makeActionCreator(testArg);
    const initialAction = actionCreator(testArg);
    expect(initialAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "ignore",
    "displayName": "action creator",
    "fetchFactoryId": "test-short-id",
    "key": "key:test arg",
    "share": undefined,
  },
  "payload": [Function],
  "type": "@@RESIFT/FETCH | action creator | test-short-id",
}
`);
    const dataServiceState = dataServiceReducer({}, initialAction);

    const repeatAction = actionCreator(testArg);
    const mockDispatch = jest.fn();
    const exampleServiceHandler = jest.fn(testArg => null);
    const exampleService = ({ onCancel, getCanceled }) => exampleServiceHandler;

    await handleAction({
      action: repeatAction,
      dispatch: mockDispatch,
      services: { exampleService },
      state: dataServiceState,
    });

    expect(exampleServiceHandler).not.toHaveBeenCalled();
  });

  test('conflict cancel', async () => {
    const makeActionCreator = defineFetch({
      displayName: 'action creator',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });
    const testArg = 'test arg';
    const actionCreator = makeActionCreator(testArg);
    const initialAction = actionCreator(testArg);
    expect(initialAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "action creator",
    "fetchFactoryId": "test-short-id",
    "key": "key:test arg",
    "share": undefined,
  },
  "payload": [Function],
  "type": "@@RESIFT/FETCH | action creator | test-short-id",
}
`);
    const dataServiceState = dataServiceReducer({}, initialAction);

    const repeatAction = actionCreator(testArg);
    const mockDispatch = jest.fn();
    const exampleServiceHandler = jest.fn(testArg => null);
    const exampleService = ({ onCancel, getCanceled }) => exampleServiceHandler;

    await handleAction({
      action: initialAction,
      dispatch: mockDispatch,
      services: { exampleService },
      state: dataServiceState,
    });

    await handleAction({
      action: repeatAction,
      dispatch: mockDispatch,
      services: { exampleService },
      state: dataServiceState,
    });

    expect(exampleServiceHandler).toHaveBeenCalled();
    expect(initialAction.payload.getCanceled()).toBe(true);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test('conflict cancel with error', async () => {
    const makeActionCreator = defineFetch({
      displayName: 'action creator',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });
    const testArg = 'test arg';
    const actionCreator = makeActionCreator(testArg);
    const initialAction = actionCreator(testArg);
    expect(initialAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "action creator",
    "fetchFactoryId": "test-short-id",
    "key": "key:test arg",
    "share": undefined,
  },
  "payload": [Function],
  "type": "@@RESIFT/FETCH | action creator | test-short-id",
}
`);
    // the `initialAction` is now "inflight" because we merged it into the store state
    const dataServiceState = dataServiceReducer({}, initialAction);

    const repeatAction = actionCreator(testArg);
    const mockDispatch = jest.fn();
    const exampleService = ({ onCancel, getCanceled }) => async testArg => {
      throw new Error('test error');
    };

    // this won't throw because the action handler will see that it is currently inflight and then
    // add the `initialAction.payload` to the `requestsToCancel` set.
    //
    // the `throw new Error('test error');` will still happen but the action handler will swallow
    // the error because we don't care about errors that happen on canceled requests
    await handleAction({
      action: initialAction,
      dispatch: mockDispatch,
      services: { exampleService },
      state: dataServiceState,
    });

    // this one is expected to throw because it wasn't canceled
    try {
      await handleAction({
        action: repeatAction,
        dispatch: mockDispatch,
        services: { exampleService },
        state: dataServiceState,
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`[Error: test error]`);
    }

    expect(initialAction.payload.getCanceled()).toBe(true);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });

  test('conflict cancel with CanceledError', async () => {
    const makeActionCreator = defineFetch({
      displayName: 'action creator',
      make: testArg => ({
        key: [testArg],
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });
    const testArg = 'test arg';
    const actionCreator = makeActionCreator(testArg);
    const initialAction = actionCreator();
    expect(initialAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "action creator",
    "fetchFactoryId": "test-short-id",
    "key": "key:test arg",
    "share": undefined,
  },
  "payload": [Function],
  "type": "@@RESIFT/FETCH | action creator | test-short-id",
}
`);
    // the `initialAction` is now "inflight" because we merged it into the store state
    const dataServiceState = dataServiceReducer({}, initialAction);

    const repeatAction = actionCreator(testArg);
    const mockDispatch = jest.fn();
    const exampleService = ({ onCancel, getCanceled }) => async testArg => {
      if (getCanceled()) throw new CanceledError();
      return 'blah';
    };

    // this won't throw because the action handler will see that it is currently inflight.
    // the action handler will call `initialAction.payload.cancel()` making calls to `getCanceled`
    // return `true`
    //
    // when payload gets awaited, the `CanceledError` will be thrown and caught.
    // in the catch block, the test for `error.isCanceledError` will be true and the catch
    // block will swallow the error
    await handleAction({
      action: initialAction,
      dispatch: mockDispatch,
      services: { exampleService },
      state: dataServiceState,
    });

    // this one is expected to throw because it wasn't canceled
    try {
      await handleAction({
        action: repeatAction,
        dispatch: mockDispatch,
        services: { exampleService },
        state: dataServiceState,
      });
    } catch (e) {
      expect(e).toMatchInlineSnapshot(`[Error: test error]`);
    }

    expect(initialAction.payload.getCanceled()).toBe(true);
    expect(mockDispatch).toHaveBeenCalledTimes(1);
  });
});

describe('isSuccessAction', () => {
  test('must be object', () => {
    expect(isSuccessAction('test')).toBe(false);
  });

  test('must have action type of string', () => {
    expect(isSuccessAction({ type: undefined })).toBe(false);
  });

  test('must start with the SUCCESS prefix', () => {
    const makeActionCreator = defineFetch({
      displayName: 'test',
      make: testArg => ({
        key: [testArg],
        request: () => () => {},
      }),
    });
    const action = makeActionCreator()();

    expect(isSuccessAction({ type: createActionType(SUCCESS, action.meta) }));
  });
});

describe('isErrorAction', () => {
  test('must be object', () => {
    expect(isErrorAction('test')).toBe(false);
  });

  test('must have action type of string', () => {
    expect(isErrorAction({ type: undefined })).toBe(false);
  });

  test('must start with the ERROR prefix', () => {
    const makeActionCreator = defineFetch({
      displayName: 'test',
      make: testArg => ({
        key: [testArg],
        request: () => () => {},
      }),
    });
    const action = makeActionCreator()();

    expect(isErrorAction({ type: createActionType(ERROR, action.meta) }));
  });
});
