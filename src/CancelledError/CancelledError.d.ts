export default class CancelledError extends Error {
  constructor(message?: string);
  isCancelledError: true;
}
