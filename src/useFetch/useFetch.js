import { useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import objectHash from 'object-hash';
import getFetch from '../getFetch';
import shallowEqual from '../shallowEqual';
import UNKNOWN from '../UNKNOWN';

const neverCalculated = '__NEVER_CALCULATED__';
const emptyResult = [null, UNKNOWN];

function memoize(fn) {
  let previous = neverCalculated;

  function returnPreviousIfUnchanged(...args) {
    const next = fn(...args);
    if (shallowEqual(next, previous)) return previous;
    previous = next;
    return next;
  }

  return returnPreviousIfUnchanged;
}

export default function useFetch(fetch, options = {}) {
  const memoizedGetFetch = useMemo(() => memoize(getFetch), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoizedOptions = useMemo(() => options, [objectHash(options)]);

  const selector = useCallback(
    state => (fetch ? memoizedGetFetch(fetch, state, memoizedOptions) : emptyResult),
    [fetch, memoizedOptions, memoizedGetFetch],
  );

  return useSelector(selector);
}
