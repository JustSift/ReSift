/**
 * @docs `isLoading`
 *
 * Given one or more statuses, this function will return whether the combined statues includes `LOADING`.
 *
 * If at least one status includes `LOADING` this will return `true.`
 */
export default function isLoading(...statuses: number[]): boolean;
