import defineFetch from '../defineFetch';
import clearFetch, { isClearAction } from './clearFetch';
import CLEAR from '../prefixes/CLEAR';

jest.mock('shortid', () => () => 'test-shortid');

test('it creates a clear fetch action from a fetch with a dynamic key', () => {
  const makePersonFetch = defineFetch({
    displayName: 'person fetch',
    make: personId => ({
      request: () => ({ exampleService }) => exampleService(personId),
    }),
  });

  const personFetch = makePersonFetch('person123');

  const clearFetchAction = clearFetch(personFetch);

  expect(clearFetchAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "person fetch",
    "fetchFactoryId": "test-shortid",
    "key": "key:person123",
    "share": undefined,
    "type": "FETCH_INSTANCE",
  },
  "type": "@@RESIFT/CLEAR | person fetch | test-shortid",
}
`);
});

test('it creates a clear fetch action from a fetch with a static key', () => {
  const makeTestFetch = defineFetch({
    displayName: 'test fetch',
    make: () => ({
      request: () => ({ exampleService }) => exampleService(),
    }),
  });

  const testFetch = makeTestFetch();

  const clearFetchAction = clearFetch(testFetch);

  expect(clearFetchAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "test fetch",
    "fetchFactoryId": "test-shortid",
    "key": "key:",
    "share": undefined,
    "type": "FETCH_INSTANCE",
  },
  "type": "@@RESIFT/CLEAR | test fetch | test-shortid",
}
`);
});

test('it throws if you try to use a dynamic key like a static key', () => {
  const personFetch = defineFetch({
    displayName: 'person fetch',
    make: personId => ({
      request: () => ({ exampleService }) => exampleService(personId),
    }),
  });

  expect(() => clearFetch(personFetch)).toThrowErrorMatchingInlineSnapshot(
    `"[clearFetch] you tried to pass an action creatorFactory to clearFetch. Ask rico until he write docs."`,
  );
});

describe('isClearAction', () => {
  test('positive path', () => {
    expect(isClearAction({ type: CLEAR })).toBe(true);
  });
  test('negative path', () => {
    expect(isClearAction(0)).toBe(false);
  });
});
