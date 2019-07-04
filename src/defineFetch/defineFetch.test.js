import defineFetch, { isFetchAction } from './defineFetch';
import timer from '../timer';
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
        key: [id],
        fetch: () => ({ exampleService }) => exampleService(),
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

  test('it throws if there is no `key`', () => {
    expect(() => {
      const actionCreatorFactory = defineFetch({
        displayName: 'something',
        make: id => ({
          noKey: [id],
        }),
      });

      actionCreatorFactory('test-id');
    }).toThrowErrorMatchingInlineSnapshot(
      `"[defineFetch] \`key\` must be an array in the object that \`make\` returns"`,
    );
  });

  test('it throws if `fetch` is not a function', () => {
    expect(() => {
      const actionCreatorFactory = defineFetch({
        displayName: 'something',
        make: id => ({
          key: [id],
          fetch: 'not a function',
        }),
      });

      actionCreatorFactory('test-id');
    }).toThrowErrorMatchingInlineSnapshot(
      `"[defineFetch] \`fetch\` must be a function in the object that \`make\` returns\`"`,
    );
  });

  test('the action creator factory returns an action creator with meta', () => {
    const actionCreatorFactory = defineFetch({
      displayName: 'example fetch',
      make: id => ({
        key: [id],
        fetch: () => ({ exampleService }) => exampleService(),
      }),
    });

    const actionCreator = actionCreatorFactory('test-id');

    expect(typeof actionCreator).toBe('function');
    expect(actionCreator.meta).toMatchInlineSnapshot(`
Object {
  "actionCreatorId": "test-short-id",
  "conflict": "cancel",
  "displayName": "example fetch",
  "key": "key:test-id",
  "share": undefined,
  "type": "ACTION_CREATOR",
}
`);
  });

  test('the payload function should include the cancellation mechanism', () => {
    const actionCreatorFactory = defineFetch({
      displayName: 'example payload',
      make: testArg => ({
        key: [testArg],
        fetch: () => ({ exampleService }) => exampleService(testArg),
      }),
    });

    const actionCreator = actionCreatorFactory('test arg');
    const action = actionCreator('test arg');

    expect(typeof action.payload).toBe('function');
    expect(typeof action.payload.cancel).toBe('function');
    expect(typeof action.payload.getCancelled).toBe('function');
    expect(typeof action.payload.onCancel).toBe('function');
  });

  test('the cancellation mechanism works', async () => {
    // given
    const actionCreatorFactory = defineFetch({
      displayName: 'example payload',
      make: testArg => ({
        key: [testArg],
        fetch: () => ({ exampleService }) => exampleService(testArg),
      }),
    });

    const actionCreator = actionCreatorFactory('test arg');
    const action = actionCreator('test arg');
    const onCancelledCalled = new DeferredPromise();
    expect(action.payload.getCancelled()).toBe(false);

    action.payload({
      exampleService: async testArg => {
        await timer(100);
        return testArg;
      },
    });

    action.payload.onCancel(() => {
      onCancelledCalled.resolve();
    });

    // when
    action.payload.cancel();

    // then
    await onCancelledCalled;
    expect(action.payload.getCancelled()).toBe(true);
  });

  test('it memoizes the action creator factory', () => {
    const makeActionCreator = defineFetch({
      displayName: 'action creator',
      make: id => ({
        key: [id],
        fetch: () => () => {},
      }),
    });

    const exampleId = 'example-id';
    const actionCreatorOne = makeActionCreator(exampleId);
    const actionCreatorTwo = makeActionCreator(exampleId);

    expect(actionCreatorOne).toBe(actionCreatorTwo);
  });
});

describe('isFetchAction', () => {
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
        key: [testArg],
        fetch: () => ({ exampleService }) => exampleService(),
      }),
    });

    const actionCreator = actionCreatorFactory('test-args');
    const action = actionCreator();

    expect(isFetchAction(action)).toBe(true);
  });
});
