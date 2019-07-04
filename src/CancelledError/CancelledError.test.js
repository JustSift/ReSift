import CancelledError from './CancelledError';

test('it is an instanceof Error', () => {
  const cancelledError = new CancelledError('test message');
  expect(cancelledError).toBeInstanceOf(Error);
});

test('has the property isCancelledError', () => {
  const cancelledError = new CancelledError('test message');
  expect(cancelledError.isCancelledError).toBe(true);
});
