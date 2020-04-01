import useClearFetch from './useClearFetch';
import useDispatch from '../useDispatch';
import defineFetch from '../defineFetch';

jest.mock('shortid', () => () => 'test-short-id');

const mockDispatch = jest.fn();
function mockGet() {
  return mockDispatch;
}
jest.mock('../useDispatch', () => () => mockGet());
jest.mock('react', () => ({ useCallback: (cb) => cb }));

test('it returns a function that calls dispatch', () => {
  const makePersonFetch = defineFetch({
    displayName: 'fetch person',
    make: (personId) => ({
      request: () => ({ exampleService }) => exampleService(),
    }),
  });

  const personFetch = makePersonFetch('person123');

  const clear = useClearFetch();

  clear(personFetch);

  const dispatch = useDispatch();
  expect(dispatch).toHaveBeenCalled();
  expect(dispatch.mock.calls[0][0]).toMatchInlineSnapshot(`
Object {
  "meta": Object {
    "conflict": "cancel",
    "displayName": "fetch person",
    "fetchFactoryId": "test-short-id",
    "key": "key:person123",
    "share": undefined,
    "type": "FETCH_INSTANCE",
  },
  "type": "@@RESIFT/CLEAR | fetch person | test-short-id",
}
`);
});
