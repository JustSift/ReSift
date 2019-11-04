/**
 * @docs `isError`
 *
 * Given one or more statuses, this function will return whether the combined statues includes `ERROR`.
 *
 * If at least one status includes `ERROR` this will return `true.`
 */
export default function isError(...statuses: number[]): boolean;
