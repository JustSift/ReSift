import CanceledError from './CanceledError';

test('it is an instanceof Error', () => {
  const canceledError = new CanceledError('test message');
  expect(canceledError).toBeInstanceOf(Error);
});

test('has the property isCanceledError', () => {
  const canceledError = new CanceledError('test message');
  expect(canceledError.isCanceledError).toBe(true);
});
