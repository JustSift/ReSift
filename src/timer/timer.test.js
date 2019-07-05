import timer from './timer';

describe('timer', () => {
  test('waits the time it should wait', async () => {
    let order = [];
    const timer300 = timer(300).then(() => order.push(300));
    const timer200 = timer(200).then(() => order.push(200));
    const timer100 = timer(100).then(() => order.push(100));

    await Promise.all([timer300, timer200, timer100]);

    expect(order).toEqual([100, 200, 300]);
  });
  test("resolves to the string literal 'TIMER' if the 2nd param isn't there", async () => {
    const result = await timer(300);

    expect(result).toBe('TIMER');
  });
  test("resolves to the second parameter if it's present", async () => {
    const testId = 'some id';
    const shouldBeTheId = await timer(300, testId);
    expect(shouldBeTheId).toBe(testId);
  });
});
