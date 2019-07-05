/**
 * wraps `setTimeout` in a promise and resolves it to the second paramter `id`
 * or the string literal `'TIMER'` if that argument is not present
 */
export default function timer(milliseconds, id) {
  return new Promise((resolve, reject) => {
    try {
      setTimeout(() => {
        resolve(id || 'TIMER');
      }, milliseconds);
    } catch (e) {
      reject(e);
    }
  });
}
