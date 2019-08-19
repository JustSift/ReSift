export default class CanceledError extends Error {
  constructor(message?: string);
  isCanceledError: true;
}
