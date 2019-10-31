import defineFetch, { isFetchAction, normalizeMerge, replace } from './defineFetch';
import delay from 'delay';
import DeferredPromise from '../DeferredPromise';

jest.mock('shortid', () => () => 'test-short-id');

describe('defineFetch', () => {
  test('it throws if there is no displayName', () => {
    expect(() => {
      defineFetch({
        displayName: '',
      });
    }).toThrowErrorMatchingInlineSnapshot(`"\`displayName\` is required in \`defineFetch\`"`);
  });

  test('it throws if there is no make', () => {
    expect(() => {
      defineFetch({
        displayName: 'something',
        make: undefined,
      });
    }).toThrowErrorMatchingInlineSnapshot(`"\`make\` is required in \`defineFetch\`"`);
  });

  test('it should return a actionCreatorFactory function', () => {
    const actionCreatorFactory = defineFetch({
      displayName: 'something',
      make: id => ({
        request: () => ({ exampleService }) => exampleService(),
      }),
    });

    const actionCreator = actionCreatorFactory('id');

    expect(typeof actionCreator).toBe('function');
  });

  test("it throws if `make` doesn't return an object", () => {
    expect(() => {
      const actionCreatorFactory = defineFetch({
        displayName: 'something',
        make: _ => 'not an object',
      });

      actionCreatorFactory('test-id');
    }).toThrowErrorMatchingInlineSnapshot(`"[defineFetch]: \`make\` must return an object"`);
  });

  test("it throws if the make args aren't strings or numbers", () => {
    expect(() => {
      const actionCreatorFactory = defineFetch({
        displayName: 'Get Something',
        make: id => ({
          request: () => () => {},
        }),
      });

      actionCreatorFactory(null);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[defineFetch] make arguments must be either a string or a number. Check calls to the fetch factory \\"Get Something\\" See here https://resift.org/docs/main-concepts/whats-a-fetch#making-a-fetch-and-pulling-data-from-it"`,
    );
  });

  test('it throws if `fetch` is not a function', () => {
    expect(() => {
      const actionCreatorFactory = defineFetch({
        displayName: 'something',
        make: id => ({
          request: 'not a function',
        }),
      });

      actionCreatorFactory('test-id');
    }).toThrowErrorMatchingInlineSnapshot(
      `"[defineFetch] \`request\` must be a function in the object that \`make\` returns\`"`,
    );
  });

  test("it throws if `request` doesn't return a function", () => {
    const makeFetch = defineFetch({
      displayName: 'Example',
      make: () => ({
        request: () => 'not a function',
      }),
    });

    const fetch = makeFetch();

    expect(() => {
      fetch();
    }).toThrowErrorMatchingInlineSnapshot(
      `"[defineFetch] Expected \`fetch\` to return a curried function. https://resift.org/docs/main-concepts/how-to-define-a-fetch#the-request-function"`,
    );
  });

  test('the action creator factory returns an action creator with meta', () => {
    const actionCreatorFactory = defineFetch({
      displayName: 'example fetch',
      make: id => ({
        request: () => ({ exampleService }) => exampleService(),
      }),
    });

    const actionCreator = actionCreatorFactory('test-id');

    expect(typeof actionCreator).toBe('function');
    expect(actionCreator.meta).toMatchInlineSnapshot(`
      Object {
        "conflict": "cancel",
        "displayName": "example fetch",
        "fetchFactoryId": "test-short-id",
        "key": "key:test-id",
        "share": undefined,
        "type": "FETCH_INSTANCE",
      }
    `);
  });

  test('the payload function should include the cancellation mechanism', () => {
    const actionCreatorFactory = defineFetch({
      displayName: 'example payload',
      make: testArg => ({
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });

    const actionCreator = actionCreatorFactory('test arg');
    const action = actionCreator('test arg');

    expect(typeof action.payload).toBe('function');
    expect(typeof action.payload.cancel).toBe('function');
    expect(typeof action.payload.getCanceled).toBe('function');
    expect(typeof action.payload.onCancel).toBe('function');
  });

  test('the cancellation mechanism works', async () => {
    // given
    const actionCreatorFactory = defineFetch({
      displayName: 'example payload',
      make: testArg => ({
        request: () => ({ exampleService }) => exampleService(testArg),
      }),
    });

    const actionCreator = actionCreatorFactory('test arg');
    const action = actionCreator('test arg');
    const onCanceledCalled = new DeferredPromise();
    expect(action.payload.getCanceled()).toBe(false);

    action.payload({
      exampleService: async testArg => {
        await delay(100);
        return testArg;
      },
    });

    action.payload.onCancel(() => {
      onCanceledCalled.resolve();
    });

    // when
    action.payload.cancel();

    // then
    await onCanceledCalled;
    expect(action.payload.getCanceled()).toBe(true);
  });

  test('it memoizes the action creator factory', () => {
    const makeActionCreator = defineFetch({
      displayName: 'action creator',
      make: id => ({
        request: () => () => {},
      }),
    });

    const exampleId = 'example-id';
    const actionCreatorOne = makeActionCreator(exampleId);
    const actionCreatorTwo = makeActionCreator(exampleId);

    expect(actionCreatorOne).toBe(actionCreatorTwo);
  });
});

describe('isFetchAction', () => {
  test('falsy value', () => {
    expect(isFetchAction(null)).toBe(false);
  });
  test('negative path', () => {
    const action = {
      type: 'something else',
    };

    expect(isFetchAction(action)).toBe(false);
  });
  test('positive path', () => {
    const actionCreatorFactory = defineFetch({
      displayName: 'test fetch',
      make: testArg => ({
        request: () => ({ exampleService }) => exampleService(),
      }),
    });

    const actionCreator = actionCreatorFactory('test-args');
    const action = actionCreator();

    expect(isFetchAction(action)).toBe(true);
  });
});

test('staticFetchFactoryId', () => {
  const fetchFactory = defineFetch({
    displayName: 'Get Example',
    staticFetchFactoryId: 'example-static-fetch-factory-id',
    make: () => ({ http }) =>
      http({
        method: 'GET',
        route: '/example',
      }),
  });

  expect(fetchFactory.meta).toMatchInlineSnapshot(`
    Object {
      "displayName": "Get Example",
      "fetchFactoryId": "example-static-fetch-factory-id",
      "type": "FETCH_INSTANCE_FACTORY",
    }
  `);
});

describe('normalizeMerge', () => {
  const namespace = 'testNamespace';

  test('if falsy, returns replace', () => {
    const result = normalizeMerge(null, namespace);
    expect(result).toMatchInlineSnapshot(`
          Object {
            "testNamespace": [Function],
          }
        `);
    expect(result[namespace]).toBe(replace);
  });

  test('if merge is a function, returns an object with the correct namespace', () => {
    const result = normalizeMerge(() => ({}), namespace);
    expect(result).toMatchInlineSnapshot(`
          Object {
            "testNamespace": [Function],
          }
        `);
    expect(result[namespace]).not.toBe(replace);
  });

  test('if merge is an object and does not contain the current namespace, returns an object with replace', () => {
    const result = normalizeMerge(
      {
        otherNamespace: () => ({}),
      },
      namespace,
    );
    expect(result).toMatchInlineSnapshot(`
      Object {
        "otherNamespace": [Function],
        "testNamespace": [Function],
      }
      `);
    expect(result[namespace]).toBe(replace);
  });

  test('if merge is an object but does contain the current namespace, returns the object as-is', () => {
    const mergeFn = () => ({});
    const mergeObj = {
      [namespace]: mergeFn,
    };
    const result = normalizeMerge(mergeObj, namespace);

    expect(result).toMatchInlineSnapshot(`
      Object {
        "testNamespace": [Function],
      }
      `);
    expect(result).toBe(mergeObj);
  });

  test('if nothing matches, throw', () => {
    expect(() => {
      normalizeMerge('test', namespace);
    }).toThrowErrorMatchingInlineSnapshot(
      `"[sharedReducer] Could not match typeof merge. See here for how to define merges: https://resift.org/docs/main-concepts/sharing-state-between-fetches#merges"`,
    );
  });
});
