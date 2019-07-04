import defineFetch from '../defineFetch';
import clearFetch from './clearFetch';

jest.mock('shortid', () => () => 'test-shortid');

test('it creates a clear fetch action from a fetch with a dynamic key', () => {
  const makePersonFetch = defineFetch({
    displayName: 'person fetch',
    make: personId => ({
      key: [personId],
      fetch: () => ({ exampleService }) => exampleService(personId),
    }),
  });

  const personFetch = makePersonFetch('person123');

  const clearFetchAction = clearFetch(personFetch);

  expect(clearFetchAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "actionCreatorId": "test-shortid",
    "conflict": "cancel",
    "displayName": "person fetch",
    "key": "key:person123",
    "share": undefined,
    "type": "ACTION_CREATOR",
  },
  "type": "@@RESIFT/CLEAR | person fetch | test-shortid",
}
`);
});

test('it creates a clear fetch action from a fetch with a static key', () => {
  const makeTestFetch = defineFetch({
    displayName: 'test fetch',
    make: () => ({
      key: [],
      fetch: () => ({ exampleService }) => exampleService(),
    }),
  });

  const testFetch = makeTestFetch();

  const clearFetchAction = clearFetch(testFetch);

  expect(clearFetchAction).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "actionCreatorId": "test-shortid",
    "conflict": "cancel",
    "displayName": "test fetch",
    "key": "key:",
    "share": undefined,
    "type": "ACTION_CREATOR",
  },
  "type": "@@RESIFT/CLEAR | test fetch | test-shortid",
}
`);
});

test('it throws if you try to use a dynamic key like a static key', () => {
  const personFetch = defineFetch({
    displayName: 'person fetch',
    make: personId => ({
      key: [personId],
      fetch: () => ({ exampleService }) => exampleService(personId),
    }),
  });

  expect(() => clearFetch(personFetch)).toThrowErrorMatchingInlineSnapshot(
    `"[clearFetch] you tried to pass an action creatorFactory to clearFetch. Ask rico until he write docs."`,
  );
});
