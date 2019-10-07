/**
 * @docs `createStoreKey`
 *
 * Creates a key to determine where to save an lookup fetches that aren't shared.
 *
 * > **Note**: This is an advanced API that you'll probably never use. Search in the tests for usage.
 *
 * Function signature:
 */
export default function createStoreKey(displayName: string, fetchFactoryId: string): string;
