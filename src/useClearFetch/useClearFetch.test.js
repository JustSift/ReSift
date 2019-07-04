import useClearFetch from './useClearFetch';
import useDispatch from '../useDispatch';
import defineFetch from '../defineFetch';

jest.mock('shortid', () => () => 'test-short-id');

const mockDispatch = jest.fn();
function mockGet() {
  return mockDispatch;
}
jest.mock('../useDispatch', () => () => mockGet());

test('it returns a function that calls dispatch', () => {
  const makePersonFetch = defineFetch({
    displayName: 'fetch person',
    make: personId => ({
      key: [personId],
      fetch: () => ({ exampleService }) => exampleService(),
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
    "actionCreatorId": "test-short-id",
    "conflict": "cancel",
    "displayName": "fetch person",
    "key": "key:person123",
    "share": undefined,
    "type": "ACTION_CREATOR",
  },
  "type": "@@RESIFT/CLEAR | fetch person | test-short-id",
}
`);
});
