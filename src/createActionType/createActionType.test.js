import FETCH from '../prefixes/FETCH';
import defineFetch from '../defineFetch';

import createActionType from './createActionType';

jest.mock('nanoid', () => () => 'test-short-id');

test('it takes in a fetch action and returns an action type string', () => {
  // given
  const makeActionCreator = defineFetch({
    displayName: 'example fetch',
    make: () => ({
      request: exampleArg => ({ exampleService }) => exampleService(exampleArg),
    }),
  });
  const actionCreator = makeActionCreator();
  const action = actionCreator('test');

  // when
  const actionType = createActionType(FETCH, action.meta);

  // then
  expect(actionType).toMatchInlineSnapshot(`"@@RESIFT/FETCH | example fetch | test-short-id"`);
});
