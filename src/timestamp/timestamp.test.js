import timestamp from './timestamp';

test('it returns an ISO string', () => {
  expect(typeof timestamp()).toBe('string');
});
