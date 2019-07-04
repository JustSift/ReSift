import createStoreKey from './createStoreKey';

test('createStoreKey', () => {
  expect(createStoreKey('display name', 'action-creator-id')).toMatchInlineSnapshot(
    `"display name | action-creator-id"`,
  );
});
