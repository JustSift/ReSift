/**
 * @docs `combineStatuses`
 *
 * Given the many statues, returns a single status that uses the following logic:
 *
 * - If _all_ the statuses are `UNKNOWN` then the resulting status will include `UNKNOWN`
 * - If _one_ of the statuses includes `LOADING` then the resulting status will include `LOADING`
 * - If _all_ the statuses include `NORMAL` then the resulting status will include `NORMAL`
 * - If _one_ of the statuses includes `ERROR` then the resulting status will include `ERROR`
 */
export default function combineStatuses(...statues: number[]): number;
