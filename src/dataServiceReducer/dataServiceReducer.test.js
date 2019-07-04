import dataServiceReducer from './dataServiceReducer';

test('it combines the reducers', () => {
  const newState = dataServiceReducer({}, {});

  expect(newState).toMatchInlineSnapshot(`
Object {
  "actions": Object {},
  "shared": Object {},
}
`);
});
