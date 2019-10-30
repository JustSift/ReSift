/**
 * @docs `CanceledError`
 * Throw this error inside custom data services to early-stop the execution of the request body of a
 * fetch factory. See the [data service docs](../main-concepts/what-are-data-services.md) for more info.
 */
export default class CanceledError extends Error {
  constructor(message?: string);
  isCanceledError: true;
}
