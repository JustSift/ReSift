/**
 * @docs `createActionType`
 * Given a prefix and a fetch meta, returns a `string` action type.
 *
 * To get a prefix:
 * ```js
 * import { PREFIXES } from 'resift';
 * // then use like `PREFIXES.SUCCESS`
 * ```
 *
 * > **Note**: This is an advanced API that you'll probably never use. Search in the tests for usage.
 *
 * Function signature:
 */
export default function createActionType(
  prefix: string,
  meta: { displayName: string; fetchFactoryId: string },
): string;
